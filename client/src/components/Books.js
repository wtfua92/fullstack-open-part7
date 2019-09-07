import React from 'react';
import {gql} from 'apollo-boost';
import {useQuery} from "@apollo/react-hooks";

export const GET_BOOKS = gql`
    query getBooks {
      allBooks {
        title
        published
        author {
          name
        }
      }
    }
`;

const Books = (props) => {
  const {loading, data} = useQuery(GET_BOOKS);
  if (!props.show) {
    return null
  }

  return loading ? <div>loading</div> :
    <div>
      <h2>books</h2>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>
              author
            </th>
            <th>
              published
            </th>
          </tr>
          {data.allBooks.map(a =>
            <tr key={a.title}>
              <td>{a.title}</td>
              <td>{a.author.name}</td>
              <td>{a.published}</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
};

export default Books