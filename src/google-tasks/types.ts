import { tasks_v1 } from 'googleapis';



export type Task = tasks_v1.Schema$Task;



export interface FormattedTask {
    id: string | null | undefined;
    title: string | null | undefined;
    notes: string | null;
    due: string | null;
    status: string | null | undefined;
    completed: string | null;
    updated: string | null | undefined;
}