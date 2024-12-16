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
    phoneNumber: "",
    profileImage: null,
    idNumber: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false); // Loading state
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });
  };
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    setFormData({ ...formData, profileImage: file }); // Store the file directly
  };
  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = "الرجاء إدخال الاسم الكامل.";
    }
    if (!formData.email.trim()) {
      newErrors.email = "الرجاء إدخال البريد الإلكتروني.";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "الرجاء إدخال بريد إلكتروني صالح.";
    }
    if (!formData.password) {
      newErrors.password = "الرجاء إدخال كلمة المرور.";
    } else if (formData.password.length < 8) {
      newErrors.password = "يجب أن تتكون كلمة المرور من 8 أحرف على الأقل.";
    }
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "الرجاء تأكيد كلمة المرور.";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "كلمتا المرور غير متطابقتين.";
    }
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = "الرجاء إدخال رقم الهاتف.";
    } else if (isNaN(formData.phoneNumber)) {
      newErrors.phoneNumber = "يجب أن يتكون رقم الهاتف من أرقام فقط.";
    }
    if (!formData.idNumber.trim()) {
      newErrors.idNumber = "الرجاء إدخال رقم الكارنيه.";
    } else if (isNaN(formData.idNumber)) {
      newErrors.idNumber = "يجب أن يتكون رقم الكارنيه من أرقام فقط.";
    }

    return newErrors;
  };
  const showErrorAlert = (title, text) => {
    Swal.fire({
      title,
      text,
      icon: "error",
      confirmButtonText: "حسنًا",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({}); // مسح الأخطاء السابقة قبل التحقق
    const formErrors = validateForm();
    setErrors(formErrors);

    if (Object.keys(formErrors).length > 0) {
      let errorMessages = Object.values(formErrors).join("<br>");
      Swal.fire({
        title: "تنبيه!",
        html: `الرجاء تصحيح الأخطاء التالية:<br>${errorMessages}`,
        icon: "warning",
        confirmButtonText: "حسنًا",
      });
      return;
    }
    setLoading(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("email", formData.email);
      formDataToSend.append("password", formData.password);
      formDataToSend.append("phone", formData.phoneNumber);
      formDataToSend.append("card_number", formData.idNumber);
      if (formData.profileImage) {
        formDataToSend.append("image", formData.profileImage);
      }

      const response = await axios.post(
        "https://law-office.al-mosa.com/api/register",
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      console.log("Registration successful:", response.data);
      Swal.fire({
        title: "تم إنشاء الحساب بنجاح!",
        text: "تم إنشاء حسابك بنجاح، يمكنك الآن تسجيل الدخول.",
        icon: "success",
        confirmButtonText: "تسجيل الدخول",
      }).then(() => {
        navigate("/login");
      });
    } catch (error) {
      if (error.response) {
        console.error("Error during registration:", error.response.data);
        showErrorAlert(
          "حدث خطأ!",
          error.response.data.message ||
            "حدث خطأ أثناء التسجيل، يرجى المحاولة مرة أخرى."
        );
      } else {
        console.error("Request failed", error.message);
        showErrorAlert(
          "حدث خطأ!",
          "حدث خطأ أثناء التسجيل، يرجى المحاولة مرة أخرى."
        );
      }
    } finally {
      setLoading(false);
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
            className="card  p-4 shadow"
            style={{ maxWidth: "600px", width: "100%" }}
          >
            <h2 className="text-center mb-2">إنشاء حساب</h2>
            <form onSubmit={handleSubmit}>
              <div className="row mb-1">
                <div className="col-md-6">
                  <label htmlFor="name" className="form-label">
                    الاسم الكامل
                  </label>
                  <input
                    type="text"
                    className={`form-control ${
                      errors.name ? "is-invalid" : ""
                    }`}
                    id="name"
                    placeholder="أدخل اسمك الكامل"
                    value={formData.name}
                    onChange={handleInputChange}
                  />
                  {errors.name && (
                    <div className="invalid-feedback">{errors.name}</div>
                  )}
                </div>
                <div className="col-md-6">
                  <label htmlFor="email" className="form-label">
                    البريد الإلكتروني
                  </label>
                  <input
                    type="email"
                    className={`form-control ${
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
              </div>
              <div className="row mb-1">
                <div className="col-md-6">
                  <label htmlFor="phoneNumber" className="form-label">
                    رقم الهاتف
                  </label>
                  <input
                    type="text"
                    className={`form-control ${
                      errors.phoneNumber ? "is-invalid" : ""
                    }`}
                    id="phoneNumber"
                    placeholder="أدخل رقم هاتفك"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                  />
                  {errors.phoneNumber && (
                    <div className="invalid-feedback">{errors.phoneNumber}</div>
                  )}
                </div>
                <div className="col-md-6">
                  <label htmlFor="idNumber" className="form-label">
                    رقم الكارنيه
                  </label>
                  <input
                    type="text"
                    className={`form-control ${
                      errors.idNumber ? "is-invalid" : ""
                    }`}
                    id="idNumber"
                    placeholder="أدخل رقم الكارنيه"
                    value={formData.idNumber}
                    onChange={handleInputChange}
                  />
                  {errors.idNumber && (
                    <div className="invalid-feedback">{errors.idNumber}</div>
                  )}
                </div>
              </div>
              <div className="mb-1">
                <label htmlFor="profileImage" className="form-label">
                  الصورة الشخصية
                </label>
                <input
                  type="file"
                  className="form-control"
                  id="profileImage"
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </div>
              <div className="row mb-1">
                <div className="col-md-6">
                  <label htmlFor="password" className="form-label">
                    كلمة المرور
                  </label>
                  <input
                    type="password"
                    className={`form-control ${
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
                <div className="col-md-6">
                  <label htmlFor="confirmPassword" className="form-label">
                    تأكيد كلمة المرور
                  </label>
                  <input
                    type="password"
                    className={`form-control ${
                      errors.confirmPassword ? "is-invalid" : ""
                    }`}
                    id="confirmPassword"
                    placeholder="أعد إدخال كلمة المرور"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                  />
                  {errors.confirmPassword && (
                    <div className="invalid-feedback">
                      {errors.confirmPassword}
                    </div>
                  )}
                </div>
              </div>
              <button
                type="submit"
                className="btn btn-dark w-100 mt-2"
                disabled={loading}
              >
                {loading ? "جاري إنشاء الحساب..." : "إنشاء حساب"}
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
