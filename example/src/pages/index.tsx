import type { NextPage } from "next";
import { useState } from "react";
import { api } from "src/apis/api";

export const ZodRouteTestDiv = () => {

  const [resp, setResp] = useState("");

  return (
    <div id="zodRoute">
      <button id="button" onClick={() => {
        api.zodRoute({ body: { error: false }, query: { test: "123" } })
          .then((resp) => {
            setResp(resp.hello);
          });
      }}>
        Call ZodRoute
      </button>
      <p id="p">
        {resp}
      </p>
    </div>
  );
};

export const AjvRouteTestDiv = () => {

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [result, setResult] = useState("");

  return (
    <div id="ajvRoute">
      <p>To successfully login, the credentials must</p>
      <ul>
        <li>The username must be in email format.</li>
        <li>The password must be of length &gt;= 8</li>
        <li>The username and password must be equal.</li>
      </ul>
      <p>If the password === nullnull, response will be 403 with no body.</p>
      <form onSubmit={async (e) => {
        e.preventDefault();
        const resp = await api.login({ query: { username, password, testNumberQuery: 3 } })
          .httpError(401, ({ reason }) => {
            setResult(`401 ${reason}`);
          })
          .httpError(403, () => {
            setResult("403");
          });

        setResult("Completed." + resp.token);
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
        <button id="submit" type="submit">
          Submit
        </button>
      </form>
      <p id="result">{result}</p>
    </div>
  );
};

const Home: NextPage = () => {


  return (
    <div>
      <h1>next-typed-api-routes example</h1>
      <div>
        <AjvRouteTestDiv />
      </div>

      <div>
        <ZodRouteTestDiv />
      </div>
    </div>
  );
};

export default Home;
