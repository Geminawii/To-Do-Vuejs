import { createRouter, createWebHistory } from 'vue-router'
import LoginPage from '@/pages/LoginPage.vue'
import DashboardPage from '@/pages/DashboardPage.vue'
import CategoriesPage from '@/pages/CategoriesPage.vue'
import ToDoDetailPage from '@/pages/ToDoDetailPage.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
 routes: [
  {
    path: '/',
    name: 'login',
    component: LoginPage,
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: DashboardPage,
  },
  {
    path: '/categories',
    name: 'categories',
    component: CategoriesPage,
  },
  {
    path: '/todo/:id',
    name: 'todo-detail',
    component: ToDoDetailPage,
    props: true,        
  },
]
})

export default router
