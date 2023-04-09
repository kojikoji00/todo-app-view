import { ChangeEvent, useState, FormEvent } from 'react';
import { Container, Grid, Paper, TextField, Button, List, ListItem, ListItemText, ListItemSecondaryAction, IconButton, makeStyles, Typography } from '@material-ui/core';
import { Add, Delete } from '@material-ui/icons';
import { gql, useMutation } from '@apollo/client';

type Todo = {
  id: string;
  task: string;
};

const ADD_TODO = gql`
  mutation AddTodo($task: String!) {
    addTodo(task: $task) {
      id
      task
    }
  }
`;

const DELETE_TODO = gql`
  mutation DeleteTodo($id: String!) {
    deleteTodo(id: $id) {
      id
    }
  }
`;

const useStyles = makeStyles((theme) => ({
  container: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
  },
  paper: {
    padding: theme.spacing(2),
  },
}));

export default function TodoApp() {
  const [todos, setTodos] = useState<Array<Todo>>([]);
  const [task, setTask] = useState<string>('');
  const classes = useStyles();
  const [addTodo, { loading, error }] = useMutation(ADD_TODO);
  const [deleteTodo, { loading: deleteLoading, error: deleteError }] = useMutation(DELETE_TODO);

  const handleTaskChange = (event: ChangeEvent<HTMLInputElement>) => {
    setTask(event.target.value);
  };

  const handleTaskSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (task) {
        try {
          const { data } = await addTodo({ variables: { task } });
          setTodos([...todos, data.addTodo]);
          setTask(''); // フィールドクリア
        } catch (err) {
          console.error(err);
        }
      }
  };


  const handleTaskDelete = async (id: string) => {
    try {
      await deleteTodo({ variables: { id } });
      setTodos(todos.filter((todo) => todo.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <Container className={classes.container}>
      <Grid container direction="column" alignItems="center" justifyContent="center" spacing={4}>
        <Grid item>
          <Typography variant="h4">Todo App</Typography>
        </Grid>
        <Grid item>
          <Paper className={classes.paper}>
            <Grid container spacing={2} alignItems="center" justifyContent="center">
              <Grid item xs={12} sm={9}>
                <TextField fullWidth label="Task" value={task} onChange={handleTaskChange} />
              </Grid>
              <Grid item xs={12} sm={3}>
                <Button fullWidth variant="contained" color="primary" onClick={handleTaskSubmit}>
                  <Add />
                  Add Task
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        <Grid item>
          {/* ここでGraphQLのQueryを実行してタスクリストを表示する */}
          <List>
            {todos.map((todo) => (
              <ListItem key={todo.id} button>
                <ListItemText primary={todo.task} />
                <ListItemSecondaryAction>
                  <IconButton edge="end" aria-label="delete" onClick={() => handleTaskDelete(todo.id)}>
                    <Delete />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </Grid>
      </Grid>
    </Container>
  );
}