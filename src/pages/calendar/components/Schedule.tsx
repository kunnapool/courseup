import { Badge, Table, Tbody, Td, Th, Thead, Tr } from '@chakra-ui/react';

import { MeetingTimes } from 'lib/fetchers';
import getRMPRating from '../../scheduler/components/downloader';

export interface ScheduleProps {
  /**
   * Array of MeetingTimes, which hold meeting time like every monday at 12:30 pm
   * and also days and instructor info.
   */
  meetingTimes: MeetingTimes[];
}

export const rating: string[] = [];

export async function setRatings({ meetingTimes }: ScheduleProps): Promise<string[]> {
  let i = 0;
  for (const m of meetingTimes) {
    const rmp = await getRMPRating(m.instructors[0].split(' ')[0], m.instructors[0].split(' ')[1]);
    rating[i++] = rmp;
  }
  return rating;
}

export function Schedule({ meetingTimes }: ScheduleProps): JSX.Element {
  return (
    <Table variant="striped" size="sm">
      <Thead>
        <Tr>
          <Th>Days</Th>
          <Th>Dates</Th>
          <Th>Time</Th>
          {/* TODO: verify if we can safely exclude this for most cases */}
          {/* <Th>Schedule Type</Th> */}
          <Th>Location</Th>
          <Th>Instructors</Th>
          <Th>Rating</Th>
        </Tr>
      </Thead>
      <Tbody>
        {meetingTimes.map((m, i) => (
          <Tr key={i}>
            <Td>
              <Badge>{m.days}</Badge>
            </Td>
            <Td>{m.dateRange}</Td>
            <Td>{m.time}</Td>
            {/* TODO: verify if we can safely exclude this for most cases */}
            {/* <Td>{m.scheduleType}</Td> */}
            <Td>{m.where}</Td>
            <Td>{m.instructors.join(', ')}</Td>
            <Td>{rating[i]}</Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  );
}
