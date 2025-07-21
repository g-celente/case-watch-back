export const TaskStatus = {
  PENDING: 'PENDING',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED'
};

export const Priority = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  URGENT: 'URGENT'
};

export const CollaborationRole = {
  VIEWER: 'VIEWER',
  EDITOR: 'EDITOR',
  ADMIN: 'ADMIN'
};

export class Task {
  constructor(data) {
    this.id = data.id;
    this.title = data.title;
    this.description = data.description;
    this.status = data.status || TaskStatus.PENDING;
    this.priority = data.priority || Priority.MEDIUM;
    this.dueDate = data.dueDate;
    this.ownerId = data.ownerId;
    this.categoryId = data.categoryId;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  static fromPrisma(prismaTask) {
    return new Task(prismaTask);
  }

  toJSON() {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      status: this.status,
      priority: this.priority,
      dueDate: this.dueDate,
      ownerId: this.ownerId,
      categoryId: this.categoryId,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  isOverdue() {
    if (!this.dueDate) return false;
    return new Date() > new Date(this.dueDate) && this.status !== TaskStatus.COMPLETED;
  }

  canBeEditedBy(userId) {
    return this.ownerId === userId;
  }

  getPriorityWeight() {
    const weights = {
      [Priority.LOW]: 1,
      [Priority.MEDIUM]: 2,
      [Priority.HIGH]: 3,
      [Priority.URGENT]: 4
    };
    return weights[this.priority] || 2;
  }

  getStatusProgress() {
    const progress = {
      [TaskStatus.PENDING]: 0,
      [TaskStatus.IN_PROGRESS]: 50,
      [TaskStatus.COMPLETED]: 100,
      [TaskStatus.CANCELLED]: 0
    };
    return progress[this.status] || 0;
  }
}
