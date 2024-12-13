import React, { useState } from "react";
import Swal from "sweetalert2";

const ResetPassword = () => {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    // التحقق من أن الحقول ليست فارغة
    if (
      !email.trim() ||
      !code.trim() ||
      !newPassword.trim() ||
      !confirmPassword.trim()
    ) {
      Swal.fire({
        title: "تنبيه!",
        text: "الرجاء ملء جميع الحقول المطلوبة.",
        icon: "warning",
        confirmButtonText: "موافق",
      });
      setLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      Swal.fire({
        title: "خطأ!",
        text: "كلمة المرور الجديدة وتأكيدها غير متطابقتين.",
        icon: "error",
        confirmButtonText: "موافق",
      });
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        "https://law-office.al-mosa.com/api/reset-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            email,
            code,
            password: newPassword,
            password_confirmation: confirmPassword,
          }),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        Swal.fire({
          title: "حدث خطأ!",
          text:
            data.message ||
            "حدث خطأ أثناء محاولة إعادة تعيين كلمة المرور. يرجى المحاولة مرة أخرى.",
          icon: "error",
          confirmButtonText: "موافق",
        });
        setLoading(false);
      } else {
        Swal.fire({
          title: "تمت العملية بنجاح!",
          text: "تم إعادة تعيين كلمة المرور بنجاح.",
          icon: "success",
          confirmButtonText: "موافق",
        });
        setLoading(false);
      }
    } catch (error) {
      console.error("Network error:", error);
      Swal.fire({
        title: "خطأ في الاتصال!",
        text: "حدث خطأ أثناء الاتصال بالخادم. يرجى المحاولة مرة أخرى.",
        icon: "error",
        confirmButtonText: "موافق",
      });
      setLoading(false);
    }

    setEmail("");
    setCode("");
    setNewPassword("");
    setConfirmPassword("");
  };

  return (
    <div className="container vh-100" style={{ direction: "rtl" }}>
      <div className="row justify-content-center">
        <div className="col-xl-6 col-12">
          <div className="card hover shadow-lg p-3 mt-5">
            <h2 className="text-center">إعادة تعيين كلمة السر</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="email" className="form-label">
                  البريد الإلكتروني
                </label>
                <input
                  type="email"
                  id="email"
                  className="form-control"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="أدخل بريدك الإلكتروني"
                />
              </div>

              <div className="mb-3">
                <label htmlFor="code" className="form-label">
                  كود التأكيد
                </label>
                <input
                  type="text"
                  id="code"
                  className="form-control"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="أدخل كود التأكيد"
                />
              </div>

              <div className="mb-3">
                <label htmlFor="newPassword" className="form-label">
                  كلمة المرور الجديدة
                </label>
                <input
                  type="password"
                  id="newPassword"
                  className="form-control"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="أدخل كلمة المرور الجديدة"
                />
              </div>

              <div className="mb-3">
                <label htmlFor="confirmPassword" className="form-label">
                  تأكيد كلمة المرور الجديدة
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  className="form-control"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="أعد إدخال كلمة المرور الجديدة"
                />
              </div>

              <button
                type="submit"
                className="btn btn-dark w-100"
                disabled={loading}
              >
                {loading
                  ? "جاري إعادة تعيين كلمة المرور..."
                  : "إعادة تعيين كلمة المرور"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
