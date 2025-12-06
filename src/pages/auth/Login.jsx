import React, { useState } from "react";
import { Form, Input, Button, Typography, Card, message, Checkbox } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { motion } from "framer-motion";
import logo from "../../assets/images/layout/logo.png";
import "../../assets/css/login.css";
import loginImg from "../../assets/images/login.png";
import { useContext } from "react";
import { AuthContext } from "../../contexts/AuthProvider.jsx";
import { Navigate, useNavigate } from "react-router-dom";


const { Title } = Typography;

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { login, token, loading: authLoading } = useContext(AuthContext);
  if (authLoading) return <div>Loading...</div>;
  if (token) return <Navigate to="/dashboard" replace />;

  const onFinish = async (values) => {
    setLoading(true);
    try {
      await login(values.email, values.password);
      message.success("Login berhasil!");
      navigate("/dashboard");
    } catch (error) {
      message.error("Email atau password salah!");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const success = () => {
    message.success('This is a success message');
  };

  return (
    <div className="login-container">
      {/* Bagian kiri */}
      <div className="login-left">
        <img src={logo} alt="Logo" className="logo-image" />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{ width: "60%" }}
        >
          <Form form={form} layout="vertical" onFinish={onFinish}>
            <div style={{ marginBottom: "8px" }}>
              <h2 className="text-center mb-4">Email</h2>
            </div>
            <Form.Item
              name="email"
              rules={[{ required: true, message: "Please enter your email" }]}
              style={{ marginBottom: "5px" }}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="Email"
                disabled={loading}
                style={{
                  height: "40px",
                  boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
                }}
              />
            </Form.Item>

            <div style={{ marginBottom: "8px" }}>
              <h2 className="text-center mb-4">Password</h2>
            </div>
            <Form.Item
              name="password"
              rules={[{ required: true, message: "Please enter your password" }]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Password"
                disabled={loading}
                style={{
                  height: "40px",
                  boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
                }}
              />
            </Form.Item>

            <Form.Item name="remember" valuePropName="checked">
              <Checkbox>Keep me logged in</Checkbox>
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                style={{
                  width: "100%",
                  height: "40px",
                  borderRadius: "5px",
                  fontWeight: "bold",
                  fontSize: "18px",
                }}
              >
                Log in
              </Button>
            </Form.Item>
          </Form>

        </motion.div>
      </div>

      {/* Bagian kanan */}
      <div className="login-right">
        <div className="welcome-content">
          <h2 className="welcome-text-selamat">Selamat</h2>
          <h2 className="welcome-text-datang">Datang!</h2>

          <div className="illustration-wrapper">
            <img
              src={loginImg}
              alt="Welcome Illustration"
              className="illustration-image"
            />
          </div>

          <div className="decorative-circle"></div>
        </div>
      </div>
    </div>
  );
};

export default Login;
