import { createBrowserRouter } from "react-router-dom";
import EventsPage from "@/pages/Events";
import HomePage from "@/pages/Home";
import HistoryPage from "@/pages/History";
import OrganizerPage from "@/pages/Organizer";
import ResalePage from "@/pages/Resale";
import TicketsPage from "@/pages/Tickets";
import VerifyPage from "@/pages/Verify";

import LoginPage from "@/pages/Login";
import SignupPage from "@/pages/Signup";

import { EventDetail } from "@/components/event/event-detail";

const router = createBrowserRouter([
    {
        path: "/",
        element: <HomePage/>
    },
    {
        path: "/login",
        element: <LoginPage/>
    },
    {
        path: "/signup",
        element: <SignupPage/>
    },
    {
        path: '/events',
        element: <EventsPage/>
    },
    {
        path: '/history',
        element: <HistoryPage/>
    },
    {
        path: '/organizer',
        element: <OrganizerPage/>
    },
    {
        path: '/resale',
        element: <ResalePage/>
    },
    {
        path: '/tickets',
        element: <TicketsPage/>
    },
    {
        path: '/verify',
        element: <VerifyPage/>
    },
    {
        path: '/events/:id',
        element: <EventDetail/>
    }
])

export default router