import { useNavigation } from '@react-navigation/core'
import React, { useState, useEffect } from 'react'
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import firebase from '../firebase'

export default function HomeScreen() {
  const navigation = useNavigation()
  const [todos, setTodos] = useState([])
  const [todoInput, setTodoInput] = useState('')

  // Fetch todos belonging to current user from Firestore
  const getTodos = async () => {
    const user = firebase.auth().currentUser
    if (user) {
      const snapshot = await firebase.firestore().collection('todos').where('userId', '==', user.uid).get()
      const todos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      setTodos(todos)
    }
  }

  useEffect(() => {
    getTodos()
  }, [])

  const addTodo = async () => {
    const user = firebase.auth().currentUser
    if (user) {
      await firebase.firestore().collection('todos').add({
        title: todoInput,
        completed: false,
        userId: user.uid,
      })
      setTodoInput('')
      getTodos()
    }
  }

  const deleteTodo = async id => {
    await firebase.firestore().collection('todos').doc(id).delete()
    getTodos()
  }

  const handleSignOut = () => {
    firebase
      .auth()
      .signOut()
      .then(() => {
        navigation.replace('Login')
      })
      .catch(error => alert(error.message))
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Todo List</Text>
      <View style={styles.inputContainer}>
        <TextInput style={styles.input} placeholder="Add Todo" value={todoInput} onChangeText={setTodoInput} />
        <TouchableOpacity style={styles.addButton} onPress={addTodo}>
          <Text style={styles.addButtonText}>Add</Text>
        </TouchableOpacity>
      </View>
      {todos.map(todo => (
        <View key={todo.id} style={styles.todo}>
          <Text style={styles.todoTitle}>{todo.title}</Text>
          <TouchableOpacity style={styles.deleteButton} onPress={() => deleteTodo(todo.id)}>
            <Text style={styles.deleteButtonText}>Delete</Text>
          </TouchableOpacity>
        </View>
      ))}
      <Text>Email: {firebase.auth().currentUser?.email}</Text>
      <TouchableOpacity onPress={handleSignOut} style={styles.button}>
        <Text style={styles.buttonText}>Sign out</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  inputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    width: '80%',
  },
  input: {
    padding: 16,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    width: '70%',
  },
  addButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 4,
    width: '25%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
  },
  todo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    width: '80%',
  },
  todoTitle: {
    fontSize: 18,
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
    padding: 16,
    borderRadius: 4,
  },
  deleteButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
  },
  button: {
    backgroundColor: '#0782F9',
    width: '60%',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 40,
  },
  buttonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16,
  },
})
