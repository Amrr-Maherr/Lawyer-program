import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";

const CaseTypes = () => {
  const [caseTypes, setCaseTypes] = useState([]);
  const [newCaseType, setNewCaseType] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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

  const checkIfCaseTypeLinked = async (id) => {
    const token = localStorage.getItem("token");
    if (!token) {
      Swal.fire("تحذير", "يرجى تسجيل الدخول أولاً.", "warning");
      return false;
    }

    try {
      const response = await axios.get(
        `https://law-office.al-mosa.com/api/cases?case_category_id=${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data.length > 0;
    } catch (err) {
      Swal.fire("حدث خطأ", "فشل في التحقق من القضايا المرتبطة.", "error");
      return false;
    }
  };

  const handleDeleteCaseType = async (id) => {
    const token = localStorage.getItem("token");
    if (!token) {
      Swal.fire("تحذير", "يرجى تسجيل الدخول أولاً.", "warning");
      return;
    }

    const isLinked = await checkIfCaseTypeLinked(id);
    if (isLinked) {
      Swal.fire("تحذير", "نوع القضية هذا مرتبط بقضية ولا يمكن حذفه", "warning");
      return;
    }

    const confirmDelete = await Swal.fire({
      title: "هل أنت متأكد؟",
      text: "لن تتمكن من استرجاع البيانات بعد الحذف.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "نعم، حذف!",
      cancelButtonText: "إلغاء",
    });

    if (confirmDelete.isConfirmed) {
      setLoading(true);
      try {
        await axios.delete(
          `https://law-office.al-mosa.com/api/case-category/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        Swal.fire("تم الحذف بنجاح", "تم حذف نوع القضية.", "success");
        fetchCaseTypes();
      } catch (err) {
        Swal.fire("حدث خطأ", "فشل في حذف نوع القضية.", "error");
      } finally {
        setLoading(false);
      }
    } else {
      Swal.fire("تم الإلغاء", "لم يتم حذف نوع القضية.", "info");
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
  } else {
    Swal.close();
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  return (
    <div className="container-fluid px-0 my-4">
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
                borderColor: "#0d6efd",
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
            >
              <i className="fas fa-plus me-2"></i> إضافة نوع قضية جديد
            </button>
          </div>
          <div className="col-12 col-md-4 mb-2">
            <h2 className="text-center py-2 fs-2 fw-bold">أنواع القضايا</h2>
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
                <div className="card shadow-sm border h-100">
                  <div className="card-body d-flex justify-content-between align-items-center">
                    <button
                      className="btn btn-outline-danger btn-sm rounded-circle"
                      onClick={() => handleDeleteCaseType(type.id)}
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                    <h5 className="card-title mb-0 text-end">{type.name}</h5>
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
