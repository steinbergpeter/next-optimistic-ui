'use client'

import { getTodos } from '@/lib/todos'
import { type Todo } from '@prisma/client'
import { get } from 'http'
import { useCallback, useEffect, useOptimistic, useState } from 'react'

export type OptActions =
  | {
      type: 'ADD'
      payload: Todo
    }
  | {
      type: 'UPDATE'
      payload: Pick<Todo, 'id' | 'isCompleted' | 'updatedAt'>
    }
  | {
      type: 'DELETE'
      payload: Pick<Todo, 'id'>
    }

type OptReducer = (state: Todo[], action: OptActions) => Todo[]

const OptimisticReducer: OptReducer = (state, { type, payload }) => {
  switch (type) {
    case 'ADD':
      return [...state, payload]
    case 'UPDATE':
      return state.map(todo =>
        todo.id === payload.id
          ? {
              ...todo,
              isCompleted: payload.isCompleted,
              updatedAt: payload.updatedAt
            }
          : todo
      )
    case 'DELETE':
      return state.filter(todo => todo.id !== payload.id)
    default:
      throw new Error()
  }
}

const useOptimisticTodos = () => {
  const [initialValue, setInitialValue] = useState<Todo[]>([])

  useEffect(() => {
    async function callGetTodos(){
      const getGetTodos = async () => {
        const { todos, error } = await getTodos()
        return {
          todos,
          error
        } 
    }
    setInitialValue(await callGetTodos())

  }, [])

  if (!initialValue.todos)
    throw new Error(initialValue.error || 'Failed to get todos.')

  const [optimisticState, setOptimisticState] = useOptimistic(
    initialValue.todos,
    OptimisticReducer
  )
  const optimisticAddTodo = useCallback(
    async (todo: Todo) => setOptimisticState({ type: 'ADD', payload: todo }),
    [setOptimisticState]
  )

  const optimisticUpdateTodo = useCallback(
    async (id: string, isCompleted: boolean) =>
      setOptimisticState({
        type: 'UPDATE',
        payload: { id, isCompleted, updatedAt: new Date() }
      }),
    [setOptimisticState]
  )

  const optimisticDeleteTodo = useCallback(
    async (id: string) =>
      setOptimisticState({ type: 'DELETE', payload: { id } }),
    [setOptimisticState]
  )
  return {
    optimisticState,
    optimisticAddTodo,
    optimisticUpdateTodo,
    optimisticDeleteTodo
  }
}

export default useOptimisticTodos
