import { BrowserRouter, Routes as ReactRouterRoutes, Route } from 'react-router-dom';

import { Booklist } from 'pages/booklist';
import { Calendar } from 'pages/calendar';
import { Contest } from 'pages/contest/Contest';
import { Home } from 'pages/home';
import { ImportTimetable } from 'pages/import';
import { Registration } from 'pages/registration';
import { Scheduler } from 'pages/scheduler';

// TODO: use nested routes but it doesn't work right now

export function Routes(): JSX.Element {
  return (
    <BrowserRouter>
      <ReactRouterRoutes>
        <Route path="/" element={<Home />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/calendar/:term/*" element={<Calendar />} />
        <Route path="/scheduler/" element={<Scheduler />} />
        <Route path="/scheduler/:term/*" element={<Scheduler />} />
        <Route path="/registration" element={<Registration />} />
        <Route path="/registration/:term" element={<Registration />} />
        <Route path="/booklist" element={<Booklist />} />
        <Route path="/booklist/:term" element={<Booklist />} />
        <Route path="/s/:slug" element={<ImportTimetable />} />
        <Route path="/contest" element={<Contest />} />
      </ReactRouterRoutes>
    </BrowserRouter>
  );
}
