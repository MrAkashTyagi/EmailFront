export interface WeddingTask {

  id?: number;

  title: string;

  description?: string;

  status:
    | 'TODO'
    | 'IN_PROGRESS'
    | 'DONE';

  priority:
    | 'HIGH'
    | 'MEDIUM'
    | 'LOW';

  dueDate?: string;

  assignedTo?: string;

  createdAt?: string;

  updatedAt?: string;
}
