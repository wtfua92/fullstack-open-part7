import React, { useState } from 'react'
import {useApolloClient, useMutation, useSubscription} from "@apollo/react-hooks";
import {gql} from 'apollo-boost';
import Authors from './components/Authors'
import Books from './components/Books'
import NewBook from './components/NewBook'
import Recommended from './components/Recommended';
import {GET_BOOKS} from "./components/Books";

const BOOK_DETAILS = gql`
    fragment BookDetails on Book {
        title
            published
            genres
            author {
                name
            }
    }
`;

const BOOK_ADDED = gql`
    subscription {
        bookAdded {
            ...BookDetails
        }
    }
    ${BOOK_DETAILS}
`;

const updateCacheWith = (addedBook, client) => {
    const includedIn = (set, object) =>
        set.map(b => b.id).includes(object.id);

    const dataInStore = client.readQuery({ query: GET_BOOKS });
    if (!includedIn(dataInStore.allBooks, addedBook)) {
        dataInStore.allBooks.push(addedBook);
        client.writeQuery({
            query: GET_BOOKS,
            data: dataInStore
        })
    }
};

const App = () => {
  const client = useApolloClient();
  const [page, setPage] = useState('authors');
  const [username, setUsername] = useState('');
  const [token, setToken] = useState(localStorage.getItem('book-app-user-token'));
  const LOGIN = gql`
    mutation userLogin($username: String!, $password: String!) {
        login(username: $username, password: $password) {
            value
        }
    }
  `;

  const [userLogin] = useMutation(LOGIN);
  useSubscription(BOOK_ADDED, {
      onSubscriptionData: ({subscriptionData: { data }}) => {
          window.alert(`new book added: ${data.bookAdded.title}`);
          updateCacheWith(data.bookAdded, client);
      }
  });
  const loginHandler = async (e) => {
      e.preventDefault();
      const { data } = await userLogin({
          variables: {
              username,
              password: 'password'
          }
      });
      setToken(data.login.value);
      localStorage.setItem('book-app-user-token', data.login.value);
      setUsername('');
  };

  const logOut = (e) => {
      e.preventDefault();
      setToken('');
      localStorage.removeItem('book-app-user-token');
      client.resetStore();
  };

  return (
    <div>
      <div>
        <button type="button" onClick={() => setPage('authors')}>authors</button>
        <button type="button" onClick={() => setPage('books')}>books</button>
        <button type="button" onClick={() => setPage('recommended')}>recommended</button>
        {
          token &&
          <button type="button" onClick={() => setPage('add')}>add book</button>
        }
        {
          token &&
          <button type="button" onClick={logOut}>logout</button>
        }
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

      <Recommended show={page === 'recommended'} />

    </div>
  )
};

export default App;