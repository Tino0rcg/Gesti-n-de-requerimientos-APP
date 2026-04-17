export type User = {
    id: string;
    name: string;
    email: string;
    avatarUrl: string;
    role: 'User' | 'Agent' | 'Manager';
  };
  
  export type TicketStatus = 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  export type TicketPriority = 'Low' | 'Medium' | 'High' | 'Critical';
  export type TicketCategory = 'Network' | 'Software' | 'Hardware' | 'Account' | 'Security' | 'Other';
  
  export type Ticket = {
    id: string;
    subject: string;
    description: string;
    status: TicketStatus;
    priority: TicketPriority;
    category: TicketCategory;
    createdAt: Date;
    updatedAt: Date;
    submitterId: string;
    assigneeId: string | null;
  };

  export type Note = {
    id: string;
    ticketId: string;
    authorId: string;
    content: string;
    createdAt: Date;
  }
  