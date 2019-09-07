import React, { useState } from 'react'
import { useMutation } from "@apollo/react-hooks";
import {gql} from 'apollo-boost';
import Authors from './components/Authors'
import Books from './components/Books'
import NewBook from './components/NewBook'

const App = () => {
  const [page, setPage] = useState('authors');
  const [username, setUsername] = useState('');
  const [token, setToken] = useState('');
  const LOGIN = gql`
    mutation userLogin($username: String!, $password: String!) {
        login(username: $username, password: $password) {
            value
        }
    }
  `;

  const [userLogin] = useMutation(LOGIN);

  const loginHandler = async (e) => {
      e.preventDefault();
      const { data } = await userLogin({
          variables: {
              username,
              password: 'password'
          }
      });
      setToken(data.login.value);
      setUsername('');
  };

  return (
    <div>
      <div>
        <button onClick={() => setPage('authors')}>authors</button>
        <button onClick={() => setPage('books')}>books</button>
        <button onClick={() => setPage('add')}>add book</button>
      </div>
        {!token && <div>
            <h2>Login:</h2>
            <form onSubmit={loginHandler}>
                <label htmlFor="#username">Username: </label>
                <input type="text" id="username" value={username} onChange={({ target }) => { setUsername(target.value); }}/>
                <br/>
                <label htmlFor="#password">Password: </label>
                <input type="text" id="password" disabled value="password" />
                <br/>
                <button type="submit">Log in</button>
            </form>
        </div>}
      <Authors
        show={page === 'authors'}
      />

      <Books
        show={page === 'books'}
      />

      <NewBook
        show={page === 'add'}
      />

    </div>
  )
}

export default App