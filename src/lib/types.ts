import { Timestamp } from "firebase/firestore";

export interface ChargingSession {
  id: string;
  date: Date | Timestamp | string;
  startTime: string;
  endTime: string;
  startPercentage: number;
  endPercentage:number;
  notes?: string;
}
