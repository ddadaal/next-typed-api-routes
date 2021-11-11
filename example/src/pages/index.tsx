import type { NextPage } from "next";
import { useState } from "react";
import { api } from "src/apis/api";

const Home: NextPage = () => {

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div>
      <h1>next-typed-api-routes example</h1>
      <div>
        <p>To successfully login, the credentials must</p>
        <ul>
          <li>The username must be in email format.</li>
          <li>The password must be of length &gt;= 8</li>
          <li>The username and password must be equal.</li>
        </ul>
        <form onSubmit={async (e) => {
          e.preventDefault();
          const resp = await
          api.login({ query: { username, password, testNumberQuery: 3 } })
            .httpError(401, ({ reason }) => {
              alert("401 Failed. Reason: " + reason);
            });

          alert("Completed." + resp);
        }}
        >
          <label htmlFor="Email">Email</label>
          <input
            id="username"
            placeholder="Must be in email format"
            onChange={(e) => setUsername(e.target.value)}
          />
          <label htmlFor="password">Password</label>
          <input
            id="password"
            placeholder="Must be of length >= 8"
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="submit">
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};

export default Home;
