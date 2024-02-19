'use server'

import { createTodo, updateTodo, deleteTodo } from '@/lib/todos'
import { revalidatePath } from 'next/cache'

export async function createTodoAction(title: string) {
  try {
    await createTodo(title)
  } catch (error) {
    return { error: (error as Error).message || 'Failed to add todo.' }
  } finally {
    revalidatePath('/')
  }
}

export async function updateTodoAction(id: string, isCompleted: boolean) {
  try {
    await updateTodo(id, isCompleted)
  } catch (error) {
    return { error: (error as Error).message || 'Failed to update todo.' }
  } finally {
    revalidatePath('/')
  }
}

export async function deleteTodoAction(id: string) {
  try {
    await deleteTodo(id)
  } catch (error) {
    return { error: (error as Error).message || 'Failed to delete todo.' }
  } finally {
    revalidatePath('/')
  }
}
