import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import axios from "axios";

function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false); // حالة التحميل
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

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length === 0) {
      setLoading(true); // تعيين حالة التحميل إلى true
      // إرسال البيانات إلى API
      axios
        .post("https://law-office.al-mosa.com/api/login", formData)
        .then((response) => {
          const { user, token } = response.data;

          // تخزين بيانات المستخدم و token في localStorage
          localStorage.setItem("user", JSON.stringify(user));
          localStorage.setItem("token", token); // تخزين التوكن في localStorage

          // إعادة التوجيه بعد تسجيل الدخول
          Swal.fire({
            title: "تم تسجيل الدخول بنجاح!",
            text: `مرحبًا ${user.name}`,
            icon: "success",
            confirmButtonText: "موافق",
          }).then(() => {
            setLoading(false); // تعيين حالة التحميل إلى false
            navigate("/"); // أو أي صفحة ترغب في التوجيه إليها بعد تسجيل الدخول
          });
        })
        .catch((error) => {
          Swal.fire({
            title: "خطأ",
            text: "البريد الإلكتروني أو كلمة المرور غير صحيحة.",
            icon: "error",
            confirmButtonText: "موافق",
          });
          setLoading(false); // تعيين حالة التحميل إلى false في حالة حدوث خطأ
          console.error("Error during login:", error);
        });
    } else {
      // عرض أخطاء التحقق باستخدام SweetAlert
      let errorMessages = Object.values(validationErrors).join("<br>");
      Swal.fire({
        title: "خطأ في التحقق",
        html: errorMessages,
        icon: "error",
        confirmButtonText: "موافق",
      });
      setErrors(validationErrors);
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
            <h2 className="text-center mb-4">تسجيل الدخول</h2>
            <form onSubmit={handleLoginSubmit}>
              <div className="mb-3">
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
                />
              </div>
              <div className="mb-3">
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
                />
              </div>
              <button
                type="submit"
                className="btn btn-dark w-100"
                disabled={loading} // تعطيل الزر أثناء التحميل
              >
                {loading ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
              </button>
            </form>
            <div className="mt-3 text-center">
              <p>
                ليس لديك حساب؟{" "}
                <Link to="/signup" className="text-primary">
                  انشئ حسابًا الآن
                </Link>
              </p>
              <p>
                <Link to="/ForgotPassword" className="text-primary">
                  هل نسيت كلمة المرور؟
                </Link>
              </p>
              <p>
                <Link to="/ResetPassword" className="text-primary">
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
