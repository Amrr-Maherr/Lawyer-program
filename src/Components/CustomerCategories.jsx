import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";

const CustomerCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [newCategory, setNewCategory] = useState("");

  const fetchCategories = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    if (!token) {
      setError("يرجى تسجيل الدخول أولاً.");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get(
        "https://law-office.al-mosa.com/api/categories",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setCategories(response.data || []);
    } catch (err) {
      Swal.fire("حدث خطأ", "فشل في تحميل أنواع العملاء.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async () => {
    const token = localStorage.getItem("token");
    if (!token || !newCategory) {
      Swal.fire("تحذير", "يرجى تعبئة الحقل أولاً.", "warning");
      return;
    }

    setLoading(true);
    try {
      await axios.post(
        "https://law-office.al-mosa.com/api/category",
        { name: newCategory },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      Swal.fire("تم الإضافة بنجاح", "تم إضافة نوع العميل بنجاح.", "success");
      setNewCategory("");
      fetchCategories();
    } catch (err) {
      Swal.fire("حدث خطأ", "فشل في إضافة نوع العميل.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (categoryId) => {
    const token = localStorage.getItem("token");
    if (!token) {
      Swal.fire("تحذير", "يرجى تسجيل الدخول أولاً.", "warning");
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
          `https://law-office.al-mosa.com/api/category/${categoryId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        Swal.fire("تم الحذف بنجاح", "تم حذف نوع العميل.", "success");
        fetchCategories();
      } catch (err) {
        Swal.fire("حدث خطأ", "فشل في حذف نوع العميل.", "error");
      } finally {
        setLoading(false);
      }
    } else {
      Swal.fire("تم الإلغاء", "لم يتم حذف نوع العميل.", "info");
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  if (loading) {
    Swal.fire({
      title: "جاري تحميل أنواع العملاء...",
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
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className="form-control form-control-lg rounded-3 shadow-sm"
              placeholder="أدخل نوع العميل الجديد"
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
              onClick={handleAddCategory}
            >
              <i className="fas fa-plus me-2"></i> إضافة نوع عميل جديد
            </button>
          </div>
          <div className="col-12 col-md-4 mb-2">
            <h2 className="text-center py-2 fs-2 fw-bold">أنواع العملاء</h2>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="row">
          {categories.length > 0 ? (
            categories.map((category, index) => (
              <div
                key={category.id}
                className="col-12 col-sm-6 col-md-4 col-lg-3 mb-4"
              >
                <div className="card shadow-sm border h-100">
                  <div className="card-body d-flex justify-content-between align-items-center">
                    <button
                      className="btn btn-outline-danger btn-sm rounded-circle"
                      onClick={() => handleDelete(category.id)}
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                    <h5 className="card-title mb-0 text-end">
                      {category.name}
                    </h5>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-12 text-center text-danger mt-4">
              لا توجد أنواع عملاء حالياً.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerCategories;
