;
import { constantUrlApiEndpoint } from "../src/utils/constant-url-endpoint";
import { useRouter } from "next/router";
import { useState, useEffect, ReactElement } from "react";
import Link from "next/link";
import Head from "next/head";
import { NextPage } from "next";


type NextPageWithLayout = NextPage & {
  getLayout?: (page: ReactElement) => ReactElement;
};

const Login: NextPageWithLayout = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [remember, setRemember] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const { push } = useRouter();

  // Verifica si el usuario está logeado y redirige a /dashboard
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      push("/dashboard");
    }
  }, [push]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const requestBody = { email, password };

    console.log("Enviando datos al backend:", requestBody);

    try {
      const response = await fetch(`${constantUrlApiEndpoint}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();
      console.log("Respuesta del backend:", data);

      if (!response.ok) {
        throw new Error(data.message || "Credenciales incorrectas.");
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("email", email);
      localStorage.setItem("user_name", data.name || "Usuario");

      console.log("Token guardado:", data.token);
      console.log("Email guardado para 2FA:", email);
      console.log("Nombre del usuario guardado:", data.name);

      setTimeout(() => {
        push("/twofactorauth");
      }, 200);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error desconocido";
      console.error("Error al iniciar sesión:", message);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="container-fluid"
      style={{
        
        background:
          "url('/assets/images/background.jpg') no-repeat center center/cover",
      }}
    >
      <div className="row">
        <div className="col-12 p-0">
          <div className="login-card login-dark">
            <div>
              <div className="login-main">
                <form className="theme-form" onSubmit={handleSubmit}>
                  <h4 style={{ color: "var(--primary-color)" }}>
                    Ingresa a tu cuenta
                  </h4>
                  <p>Ingresa tu email y contraseña para iniciar sesión</p>

                  {error && (
                    <p className="text-danger text-center fw-bold">{error}</p>
                  )}

                  <div className="form-group">
                    <label className="col-form-label">Dirección de Email</label>
                    <input
                      type="email"
                      className="form-control"
                      placeholder="Test@gmail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="col-form-label">Contraseña</label>
                    <div className="form-input position-relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        className="form-control"
                        placeholder="********"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                      <div
                        className="show-hide"
                        style={{ cursor: "pointer" }}
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        <span className="show">
                          {showPassword ? "Ocultar" : "Mostrar"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="form-group mb-0">
                    <div className="checkbox p-0">
                      <input
                        id="remember"
                        type="checkbox"
                        checked={remember}
                        onChange={(e) => setRemember(e.target.checked)}
                      />
                      <label className="text-muted" htmlFor="remember">
                        Recuerdame
                      </label>
                    </div>
                    <Link
                      style={{ color: "var(--primary-color)" }}
                      className="link"
                      href="/forgot-password"
                    >
                      ¿Olvidaste tu contraseña?
                    </Link>
                    <div className="text-end mt-3">
                      <button
                        className="btn btn-block w-100"
                        type="submit"
                        disabled={loading}
                        style={{
                          backgroundColor: "var(--primary-color)",
                          borderColor: "var(--primary-color)",
                          color: "#fff",
                        }}
                      >
                        {loading ? "Ingresando..." : "Iniciar sesión"}
                      </button>
                    </div>
                  </div>

                  <p className="mt-4 mb-0 text-center">
                    ¿No tienes cuenta?
                    <Link
                      style={{ color: "var(--primary-color)" }}
                      className="ms-2"
                      href="/register"
                    >
                      Crear cuenta
                    </Link>
                  </p>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
Login.getLayout = function getLayout(page: React.ReactElement) {
  return (
    <>
      <Head>
        <title>Login</title>
      </Head>
      {page}
    </>
  );
};
export default Login;
