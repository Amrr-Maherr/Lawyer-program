import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import axios from "axios";

function SignUp() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = "الاسم الكامل مطلوب";
    }
    if (!formData.email.trim()) {
      newErrors.email = "البريد الإلكتروني مطلوب";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "يرجى إدخال بريد إلكتروني صالح";
    }
    if (!formData.password) {
      newErrors.password = "كلمة المرور مطلوبة";
    } else if (formData.password.length < 8) {
      newErrors.password = "يجب أن تكون كلمة المرور مكونة من 8 أحرف على الأقل";
    }
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "يرجى تأكيد كلمة المرور";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "كلمتا المرور غير متطابقتين";
    }
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formErrors = validateForm();
    setErrors(formErrors);

    if (Object.keys(formErrors).length > 0) {
      let errorMessages = Object.values(formErrors).join("<br>");
      Swal.fire({
        title: "خطأ في التحقق",
        html: errorMessages,
        icon: "error",
        confirmButtonText: "موافق",
      });
      return;
    }

    const dataToSend = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      password_confirmation: formData.confirmPassword,
    };

    try {
      const response = await axios.post(
        "https://law-office.al-mosa.com/api/register",
        dataToSend
      );
      console.log("Registration successful:", response.data);
      Swal.fire("تم التسجيل بنجاح!", "تم التسجيل بنجاح!", "success").then(
        () => {
          navigate("/login");
        }
      );
    } catch (error) {
      if (error.response) {
        console.error("Error during registration:", error.response.data);
        Swal.fire(
          "خطأ",
          error.response.data.message || "حدث خطأ أثناء التسجيل",
          "error"
        );
      } else {
        console.error("Request failed", error.message);
        Swal.fire("خطأ", "حدث خطأ أثناء التسجيل", "error");
      }
    }
  };

  return (
    <div
      className="container form"
      style={{ height: "auto", direction: "rtl" }}
    >
      <div className="row">
        <div className="col-12 d-flex align-items-center justify-content-center vh-100">
          <div
            className="card hover p-4 shadow"
            style={{ maxWidth: "500px", width: "100%" }}
          >
            <h2 className="text-center mb-2">إنشاء حساب</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-1">
                <label htmlFor="name" className="form-label">
                  الاسم الكامل
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="name"
                  placeholder="أدخل اسمك الكامل"
                  value={formData.name}
                  onChange={handleInputChange}
                  style={{ padding: "0.375rem 0.75rem" }}
                />
              </div>
              <div className="mb-1">
                <label htmlFor="email" className="form-label">
                  البريد الإلكتروني
                </label>
                <input
                  type="email"
                  className="form-control"
                  id="email"
                  placeholder="أدخل بريدك الإلكتروني"
                  value={formData.email}
                  onChange={handleInputChange}
                  style={{ padding: "0.375rem 0.75rem" }}
                />
              </div>
              <div className="mb-1">
                <label htmlFor="password" className="form-label">
                  كلمة المرور
                </label>
                <input
                  type="password"
                  className="form-control"
                  id="password"
                  placeholder="أدخل كلمة المرور"
                  value={formData.password}
                  onChange={handleInputChange}
                  style={{ padding: "0.375rem 0.75rem" }}
                />
              </div>
              <div className="mb-1">
                <label htmlFor="confirmPassword" className="form-label">
                  تأكيد كلمة المرور
                </label>
                <input
                  type="password"
                  className="form-control"
                  id="confirmPassword"
                  placeholder="أعد إدخال كلمة المرور"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  style={{ padding: "0.375rem 0.75rem" }}
                />
              </div>
              <button type="submit" className="btn btn-dark w-100">
                إنشاء حساب
              </button>
            </form>
            <p className="text-center mt-1">
              لديك حساب؟{" "}
              <Link to="/login" className="text-primary">
                سجل الدخول
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignUp;
