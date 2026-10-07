// Set to false whenever you want to hide demo buttons from the entire app
export const ENABLE_DEMO_LOGIN = true;

export const DEMO_CREDENTIALS = {
  admin: {
    email: 'admin@demo.com',
    password: 'Password@123',
    label: 'Test Admin',
    roleName: 'Admin',
    badge: 'Admin Panel & Inventory',
    description: 'Manage catalog, approve members, issue/return books'
  },
  student: {
    email: 'student@demo.com',
    password: 'Password@123',
    label: 'Test Student / Member',
    roleName: 'Student',
    badge: 'Student Portal & Catalog',
    description: 'Browse catalog, reserve books, track history & fines'
  }
};
