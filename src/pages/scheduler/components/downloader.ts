import fetch from 'cross-fetch';

export default async function getRMPRating(firstName: string, lastName: string) {
  const curlStr = `https://www.ratemyprofessors.com/search/teachers?query=${firstName}%20${lastName}&sid=U2Nob29sLTE0ODg=`;
  const ratingRegex = /\d\.\d/g;

  const res = await fetch(curlStr, { 'Access-Control-Allow-Origin': '*' });

  if (!res.ok) {
    throw new Error('Fetch fucked up!');
  }

  const resText = await res.text();

  const i = resText.indexOf('avgRating');

  const match = resText.slice(i, i + 20).match(ratingRegex);

  return match ? match.toString() : '';
}
