import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) {
      newErrors.email = "البريد الإلكتروني مطلوب";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "يرجى إدخال بريد إلكتروني صالح";
    }
    if (!formData.password) {
      newErrors.password = "كلمة المرور مطلوبة";
    }
    return newErrors;
  };
  const showErrorAlert = (title, text) => {
    Swal.fire({
      title,
      text,
      icon: "error",
      confirmButtonText: "موافق",
    });
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrors({}); // مسح الأخطاء السابقة قبل التحقق
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length === 0) {
      setLoading(true);
      try {
        console.log(
          "Sending login request to:",
          "https://law-office.al-mosa.com/api/login"
        );
        console.log("Request data:", formData);
        const response = await axios.post(
          "https://law-office.al-mosa.com/api/login",
          formData,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        console.log("Response:", response);
        const { user, token } = response.data;
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("token", token);
        Swal.fire({
          title: "تم تسجيل الدخول بنجاح!",
          text: `مرحبًا ${user.name}`,
          icon: "success",
          confirmButtonText: "موافق",
        }).then(() => {
          navigate("/");
        });
      } catch (error) {
        console.error("Error during login:", error);
        if (error.response) {
          // التعامل مع الأخطاء التي تأتي برد من الخادم
          console.error("Response data:", error.response.data);
          console.error("Response status:", error.response.status);
          console.error("Response headers:", error.response.headers);

          if (error.response.status === 403) {
            showErrorAlert(
              "خطأ",
              `${error.response.data}يرجى التواصل مع إدارة النظام لتفعيل حسابك.`
            );
          } else if (error.response.data && error.response.data.message) {
            showErrorAlert("خطأ", error.response.data.message);
          } else {
            showErrorAlert(
              "خطأ",
              "البريد الإلكتروني أو كلمة المرور غير صحيحة."
            );
          }
        } else if (error.request) {
          // التعامل مع الأخطاء التي ليس لها رد من الخادم
          console.error("Request error:", error.request);
          showErrorAlert("خطأ", "حدث خطأ في الشبكة. يرجى المحاولة مرة أخرى.");
        } else {
          // التعامل مع الأخطاء الأخرى
          console.error("Error message:", error.message);
          showErrorAlert("خطأ", "حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.");
        }
      } finally {
        setLoading(false);
      }
    } else {
      setErrors(validationErrors);
      let errorMessages = Object.values(validationErrors).join("<br>");
      Swal.fire({
        title: "خطأ في التحقق",
        html: errorMessages,
        icon: "error",
        confirmButtonText: "موافق",
      });
    }
  };

  return (
    <div
      className="container form"
      style={{ height: "auto", direction: "rtl" }}
    >
      <div className="row justify-content-center align-items-center vh-100">
        <div className="col-12 col-md-6">
          <div className="card p-4 shadow-sm">
            <h2
              className="text-center mb-4 fw-bold"
              style={{ fontSize: "2rem" }}
            >
              تسجيل الدخول
            </h2>
            <form onSubmit={handleLoginSubmit}>
              <div className="mb-3">
                <label htmlFor="email" className="form-label fw-bold fs-5">
                  البريد الإلكتروني
                </label>
                <input
                  type="email"
                  className={`form-control border-2 ${
                    errors.email ? "is-invalid" : ""
                  }`}
                  id="email"
                  placeholder="أدخل بريدك الإلكتروني"
                  value={formData.email}
                  onChange={handleInputChange}
                />
                {errors.email && (
                  <div className="invalid-feedback">{errors.email}</div>
                )}
              </div>
              <div className="mb-3">
                <label htmlFor="password" className="form-label fw-bold fs-5">
                  كلمة المرور
                </label>
                <input
                  type="password"
                  className={`form-control border-2 ${
                    errors.password ? "is-invalid" : ""
                  }`}
                  id="password"
                  placeholder="أدخل كلمة المرور"
                  value={formData.password}
                  onChange={handleInputChange}
                />
                {errors.password && (
                  <div className="invalid-feedback">{errors.password}</div>
                )}
              </div>
              <button
                type="submit"
                className="btn btn-dark w-100 fw-bold"
                disabled={loading}
                style={{ fontSize: "1.1rem" }}
              >
                {loading ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
              </button>
            </form>
            <div className="mt-3 text-center" style={{ fontSize: "1rem" }}>
              <p>
                ليس لديك حساب؟{" "}
                <Link
                  to="/signup"
                  className="text-primary"
                  style={{ fontSize: "1rem" }}
                >
                  انشئ حسابًا الآن
                </Link>
              </p>
              <p>
                <Link
                  to="/ForgotPassword"
                  className="text-primary"
                  style={{ fontSize: "1rem" }}
                >
                  هل نسيت كلمة المرور؟
                </Link>
              </p>
              <p>
                <Link
                  to="/ResetPassword"
                  className="text-primary"
                  style={{ fontSize: "1rem" }}
                >
                  إعادة تعيين كلمة المرور
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
