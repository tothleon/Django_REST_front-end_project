import React from "react";
import "./App.css";

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      todoList: [],
      activeItem: {
        id: null,
        title: "",
        completed: false,
      },
      editing: false,
    };
    
    this.fetchTasks = this.fetchTasks.bind(this)
    this.handleChange = this.handleChange.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
    this.getCookie = this.getCookie.bind(this)
    this.startEdit = this.startEdit.bind(this)
    this.deleteItem = this.deleteItem.bind(this)
    this.doneUndone = this.doneUndone.bind(this)
  }


  getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
  }


  componentDidMount() {
    this.fetchTasks();
  }

  fetchTasks() {
    fetch("http://127.0.0.1:8000/api/task-list/")
      .then((response) => response.json())
      .then((data) =>
        this.setState({
          todoList: data,
        })
      );
  }

  handleChange(e){
    var value = e.target.value

    this.setState({
      activeItem:{
        ...this.state.activeItem,
        title: value
      }
    })
  }

  handleSubmit(e){
    e.preventDefault()

    const csrftoken = this.getCookie('csrftoken')

    let url = 'http://127.0.0.1:8000/api/task-create/'
    let method = 'POST'

    if(this.state.editing == true) {
      url = `http://127.0.0.1:8000/api/task-update/${this.state.activeItem.id}/`
      method = 'PUT'
      this.setState({
        editing:false
      })
    }
    
    fetch(url, {
      method: method,
      headers: {
        'Content-type': 'application/json',
        'X-CSRFToken': csrftoken,
      },
      body: JSON.stringify(this.state.activeItem)
    }).then((response) => {
      this.fetchTasks()
      this.setState({
        activeItem: {
          id: null,
          title: "",
          completed: false,
        }
      })
    }).catch(function(error){
    })
  }

  startEdit(task){
    this.setState({
      activeItem:task,
      editing:true,
    })
  }

  deleteItem(task){
    const csrftoken = this.getCookie('csrftoken')

    fetch(`http://127.0.0.1:8000/api/task-delete/${task.id}/`, {
      method: 'DELETE',
      headers:{
        'content-type':'application/json',
        'X-CSRFToken': csrftoken,
      }
    }).then((response) => {
      this.fetchTasks()
    })
  }

  doneUndone(task){
    task.completed = !task.completed
    
    const csrftoken = this.getCookie('csrftoken')
    const url = `http://127.0.0.1:8000/api/task-update/${task.id}/`

    fetch(url, {
      method: 'PUT',
      headers:{
        'content-type':'application/json',
        'X-CSRFToken': csrftoken,
      },
      body:JSON.stringify({'completed':task.completed, 'title':task.title})
    }).then(() => {
      this.fetchTasks()
    })
  }

  render() {
    let tasks = this.state.todoList;
    var self = this;

    return (
      <div className="container">
        <div id="task-container">
          <div id="form-wrapper">
            <form onSubmit={this.handleSubmit} id="form">
              <div className="flex-wrapper">
                <div style={{ flex: 6 }}>
                  <input onChange={this.handleChange} value={this.state.activeItem.title} type="text" className="form-control" id="title" name="title" placeholder="Add task here" />
                </div>

                <div style={{ flex: 1 }}>
                  <input type="submit" id="submit" className="btn btn-warning" name="Add" />
                </div>
              </div>
            </form>
          </div>
          <div id="list-wrapper">
            {tasks.map((task, index) => {
              return (
                <div key={index} className="task-wrapper flex-wrapper">

                  <div onClick={() => self.doneUndone(task)} style={{flex: 7}}>

                    {task.completed ? <strike>{task.title}</strike> : <span>{task.title}</span>}

                  </div>

                  <div style={{flex: 1}}>
                    <button onClick={() => self.startEdit(task)} className="btn btn-sm btn-outline-info">Edit</button>
                  </div>

                  <div style={{flex: 1}}>
                  <button onClick={() => self.deleteItem(task)} className="btn btn-sm btn-outline-dark">&#10005;</button>
                  </div>

                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }
}

export default App;
