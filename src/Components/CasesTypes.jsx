import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";

const CaseTypes = () => {
  const [caseTypes, setCaseTypes] = useState([]);
  const [newCaseType, setNewCaseType] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false); // تم اضافة isSubmitting state

  const fetchCaseTypes = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    if (!token) {
      setError("يرجى تسجيل الدخول أولاً.");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get(
        "https://law-office.al-mosa.com/api/case-categories",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setCaseTypes(response.data);
    } catch (err) {
      Swal.fire("حدث خطأ", "فشل في تحميل أنواع القضايا.", "error");
    } finally {
      setLoading(false);
      Swal.close(); // اغلاق رسالة التحميل عند الانتهاء
    }
  };

  useEffect(() => {
    fetchCaseTypes();
  }, []);

  const handleAddCaseType = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token || !newCaseType) {
      Swal.fire("تحذير", "يرجى تعبئة الحقل أولاً.", "warning");
      return;
    }

    setLoading(true);
    try {
      await axios.post(
        "https://law-office.al-mosa.com/api/case-category",
        { name: newCaseType },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      Swal.fire("تم الإضافة بنجاح", "تم إضافة نوع القضية بنجاح.", "success");
      setNewCaseType("");
      fetchCaseTypes();
    } catch (err) {
      Swal.fire("حدث خطأ", "فشل في إضافة نوع القضية.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCaseType = async (id) => {
    const token = localStorage.getItem("token");
    if (!token) {
      Swal.fire("تحذير", "يرجى تسجيل الدخول أولاً.", "warning");
      return;
    }

    setIsSubmitting(true);
    try {
      // First, try to delete the category
      await axios.delete(
        `https://law-office.al-mosa.com/api/case-category/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      Swal.fire("تم الحذف بنجاح", "تم حذف نوع القضية بنجاح.", "success").then(
        () => {
          // Update categories state immediately
          fetchCaseTypes();
        }
      );
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        if (
          err.response.data.message.includes("foreign key constraint fails")
        ) {
          Swal.fire({
            title: "تحذير",
            text: "هذا النوع مرتبط بقضايا، يرجى حذف القضايا المرتبطة أولاً.",
            icon: "warning",
            confirmButtonText: "حسناً",
          });
        } else {
          Swal.fire("حدث خطأ", "فشل في حذف نوع القضية.", "error");
        }
      } else {
        Swal.fire("حدث خطأ", "فشل في حذف نوع القضية.", "error");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    Swal.fire({
      title: "جاري تحميل أنواع القضايا...",
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  return (
    <div
      className="container-fluid px-0 my-4"
      style={{ backgroundColor: "#f0f0f0" }}
    >
      <div className="container">
        <div className="row align-items-center justify-content-center mb-4">
          <div className="col-12 col-md-4 mb-2">
            <input
              type="text"
              value={newCaseType}
              onChange={(e) => setNewCaseType(e.target.value)}
              className="form-control form-control-lg rounded-3 shadow-sm"
              placeholder="أدخل نوع القضية الجديد"
              style={{
                borderWidth: "2px",
                borderColor: "#64b5f6",
                boxShadow: "0 0 5px rgba(0, 0, 0, 0.1)",
                fontSize: "1rem",
                padding: "10px",
                transition: "border-color 0.3s ease",
              }}
            />
          </div>
          <div className="col-12 col-md-4 mb-2">
            <button
              className="btn btn-dark btn-lg w-100 d-flex align-items-center justify-content-center"
              onClick={handleAddCaseType}
              style={{ backgroundColor: "#1a237e", color: "#fff" }}
            >
              <i className="fas fa-plus me-2"></i> إضافة نوع قضية جديد
            </button>
          </div>
          <div className="col-12 col-md-4 mb-2">
            <h2
              className="text-center py-2 fs-2 fw-bold"
              style={{ color: "#1a237e" }}
            >
              أنواع القضايا
            </h2>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="row">
          {caseTypes.length > 0 ? (
            caseTypes.map((type, index) => (
              <div
                key={type.id}
                className="col-12 col-sm-6 col-md-4 col-lg-3 mb-4"
              >
                <div
                  className="card shadow-sm border h-100"
                  style={{ borderColor: "#ced4da" }}
                >
                  <div className="card-body d-flex justify-content-between align-items-center">
                    <button
                      className="btn btn-outline-danger btn-sm rounded-circle"
                      onClick={() => handleDeleteCaseType(type.id)}
                      style={{
                        backgroundColor: "#f8d7da",
                        borderColor: "#dc3545",
                        color: "#dc3545",
                      }}
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                    <h5
                      className="card-title mb-0 text-end"
                      style={{ color: "#343a40" }}
                    >
                      {type.name}
                    </h5>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-12 text-center text-danger mt-4">
              لا توجد أنواع قضايا حالياً.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CaseTypes;
