export interface User {
    id: number;
    name: string;
    email: string;
    phone?: string;
  }
  
  export interface Project {
    id: number;
    name: string;
    owner: string;
    status: string;
  }
  