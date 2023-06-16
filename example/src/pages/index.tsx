import { failEvent, HttpError } from "@ddadaal/next-typed-api-routes-runtime/lib/client";
import type { NextPage } from "next";
import { useEffect, useState } from "react";
import { api } from "src/apis/api";
import { formatHttpErrors } from "src/pages/errors";

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

export const TypeboxRouteTestDiv = () => {

  const [resp, setResp] = useState("");

  return (
    <div id="typeboxRoute">
      <button id="button" onClick={() => {
        api.typeboxRoute({ body: { error: false }, query: { test: "123" } })
          .then((resp) => {
            setResp(resp.hello);
          });
      }}>
        Call TypeboxRoute
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

export const FailEventTestDiv = () => {

  const [errors, setErrors] = useState<HttpError[]>([]);

  useEffect(() => {
    const handler = (e: HttpError) => {
      setErrors((errors) => [...errors, e]);
    };
    failEvent.register(handler);
    return () => failEvent.unregister(handler);
  }, []);


  return (
    <div id="errors">
      <button onClick={async () => {
        await api.zodRoute({ body: { error: true }, query: { test: "123" } });
      }}>
        Call Error zodRoute
      </button>
      {errors.length > 0 ? (
        <div>
          {formatHttpErrors(errors)}
        </div>
      ) : undefined}
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
      <div>
        <TypeboxRouteTestDiv />
      </div>
      <div>
        <FailEventTestDiv />
      </div>
    </div>
  );
};

export default Home;
