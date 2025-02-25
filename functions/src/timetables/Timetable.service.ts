import { get, query, set, where } from 'typesaurus';
import { Term } from '../constants';
import { CoursesCollection, TimetablesCollection } from '../db/collections';
import { TimetableCourse, Timetable } from './Timetable.model';
import * as hash from 'object-hash';
import { constructSectionKey } from '../courses/Course.service';
import { randomString } from '../utils';

export type TimetableParams = Pick<Timetable, 'courses' | 'term'>;
export type TimetableReturn = { slug: string } & Timetable;

const lectureRegex = /^A\d{2}$/;
const labRegex = /^B\d{2}$/;
const tutorialRegex = /^T\d{2}$/;

export async function getTimetable(slug: string): Promise<Timetable | null> {
  const result = await get(TimetablesCollection, slug);

  if (!result) return null;
  return {
    term: result.data.term,
    courses: result.data.courses,
  };
}

export async function addTimetable(
  courses: TimetableCourse[],
  term: Term
): Promise<TimetableReturn | null> {
  const timetableHash = hash({ ...courses, term }, { unorderedArrays: true });

  // Check to see if the timetable already exists in the DB
  const result = await query(TimetablesCollection, [
    where('hash', '==', timetableHash),
  ]);

  if (result.length > 0)
    return {
      term: result[0].data.term,
      courses: result[0].data.courses,
      slug: result[0].data.slug,
    };

  const valid = await hasValidCourses(courses, term);
  if (!valid) return null;

  const slug = randomString(12);

  await set(TimetablesCollection, slug, {
    term,
    courses,
    createdAt: new Date(Date.now()),
    hash: timetableHash,
    slug,
  });

  return {
    slug,
    term,
    courses,
  };
}

export async function hasValidCourses(
  courses: TimetableCourse[],
  term: Term
): Promise<boolean> {
  // 12 is the max length of courses we will allow for a timetable in the database
  if (courses.length > 12 || courses.length === 0) return false;

  const validations = await Promise.all(
    courses.map(async (course) => {
      for (const { section, regex } of [
        { section: course.lab, regex: labRegex },
        { section: course.lecture, regex: lectureRegex },
        { section: course.tutorial, regex: tutorialRegex },
      ]) {
        if (section && (section.length > 1 || !regex.test(section?.[0]))) {
          return false;
        }
      }

      // validate course is in database
      const doc = await get(
        CoursesCollection,
        constructSectionKey(term, course.subject, course.code)
      );

      if (!doc || doc.data.pid !== course.pid) return false;
      return true;
    })
  );

  if (validations.some((c) => !c)) return false;

  return true;
}
