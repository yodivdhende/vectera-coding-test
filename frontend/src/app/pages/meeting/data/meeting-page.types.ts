import { Meeting } from "./meeting.types";

export type MeetingPageView = {
    hasNext: boolean;
    hasPrevious: boolean; 
    meetings: Meeting[]; 
}
