import React, { useState, useEffect } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

function AddExpenseCategory() {
  const [name, setName] = useState("");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState([]);
  const [editingCategory, setEditingCategory] = useState(null);

  const fetchCategories = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    if (!token) {
      Swal.fire("تحذير", "يرجى تسجيل الدخول أولاً.", "warning");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get(
        "https://law-office.al-mosa.com/api/expense-categories",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setCategories(response.data || []);
    } catch (err) {
      console.error("Error fetching categories:", err);
      if (err.response && err.response.data && err.response.data.message) {
        Swal.fire("حدث خطأ", err.response.data.message, "error");
      } else {
        Swal.fire("حدث خطأ", "فشل في تحميل أنواع المصاريف.", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleEdit = (category) => {
    setEditingCategory(category);
    setName(category.name);
  };

  const handleUpdate = async () => {
    if (!name.trim()) {
      Swal.fire("تحذير", "يرجى تعبئة الحقل أولاً.", "warning");
      return;
    }
    setIsSubmitting(true);
    const token = localStorage.getItem("token");
    if (!token) {
      Swal.fire("تحذير", "يرجى تسجيل الدخول أولاً.", "warning");
      setIsSubmitting(false);
      return;
    }

    try {
      await axios.put(
        `https://law-office.al-mosa.com/api/expense-category/${editingCategory.id}`,
        { name: name },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      Swal.fire(
        "تم التعديل بنجاح",
        "تم تعديل نوع المصروف بنجاح.",
        "success"
      ).then(() => {
        setEditingCategory(null);
        setName("");
        fetchCategories();
      });
    } catch (err) {
      console.error("Error updating category:", err);
      if (err.response && err.response.data && err.response.data.message) {
        Swal.fire("حدث خطأ", err.response.data.message, "error");
      } else {
        Swal.fire("حدث خطأ", "فشل في تعديل نوع المصروف.", "error");
      }
    } finally {
      setIsSubmitting(false);
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
      setIsSubmitting(true);
      try {
        await axios.delete(
          `https://law-office.al-mosa.com/api/expense-category/${categoryId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        Swal.fire("تم الحذف بنجاح", "تم حذف نوع المصروف.", "success").then(
          () => {
            fetchCategories();
          }
        );
      } catch (err) {
        console.error("Error deleting category:", err);
        if (err.response && err.response.data && err.response.data.message) {
          Swal.fire("حدث خطأ", err.response.data.message, "error");
        } else {
          Swal.fire("حدث خطأ", "فشل في حذف نوع المصروف.", "error");
        }
      } finally {
        setIsSubmitting(false);
      }
    } else {
      Swal.fire("تم الإلغاء", "لم يتم حذف نوع المصروف.", "info");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!name.trim()) {
      Swal.fire("تحذير", "يرجى تعبئة الحقل أولاً.", "warning");
      return;
    }
    setIsSubmitting(true);
    setLoading(true);
    const token = localStorage.getItem("token");
    if (!token) {
      Swal.fire("تحذير", "يرجى تسجيل الدخول أولاً.", "warning");
      setIsSubmitting(false);
      setLoading(false);
      return;
    }
    try {
      const response = await axios.post(
        "https://law-office.al-mosa.com/api/expense-category",
        {
          name,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.status === 201) {
        Swal.fire({
          icon: "success",
          title: "تمت الإضافة بنجاح!",
          text: "تمت إضافة نوع المصروف بنجاح.",
          confirmButtonText: "حسناً",
        }).then(() => {
          setName("");
          fetchCategories();
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "حدث خطأ!",
          text: "فشلت إضافة نوع المصروف، يرجى المحاولة مرة أخرى.",
          confirmButtonText: "حسناً",
        });
      }
    } catch (error) {
      console.error("Error adding expense category:", error);
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        Swal.fire("حدث خطأ", error.response.data.message, "error");
      } else {
        Swal.fire({
          icon: "error",
          title: "حدث خطأ!",
          text: "فشلت إضافة نوع المصروف، يرجى المحاولة مرة أخرى.",
          confirmButtonText: "حسناً",
        });
      }
    } finally {
      setIsSubmitting(false);
      setLoading(false);
    }
  };
  if (loading) {
    Swal.fire({
      title: "جاري تحميل أنواع المصاريف...",
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
    return null;
  }

  return (
    <div className="container-fluid px-0 my-4">
      <div className="container">
        <div className="row align-items-center justify-content-center mb-4">
          <div className="col-12 col-md-4 mb-2">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="form-control form-control-lg rounded-3 shadow-sm"
              placeholder="أدخل نوع المصروف الجديد"
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
            {editingCategory ? (
              <button
                className="btn btn-dark btn-lg w-100 d-flex align-items-center justify-content-center"
                onClick={handleUpdate}
                disabled={isSubmitting}
              >
                <i className="fas fa-edit me-2"></i> تعديل نوع المصروف
              </button>
            ) : (
              <button
                className="btn btn-dark btn-lg w-100 d-flex align-items-center justify-content-center"
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                <i className="fas fa-plus me-2"></i> إضافة نوع مصروف جديد
              </button>
            )}
          </div>
          <div className="col-12 col-md-4 mb-2">
            <Link
              to="/expenses"
              className="btn btn-secondary btn-lg w-100 d-flex align-items-center justify-content-center"
            >
              <i className="fas fa-arrow-left me-2"></i> الرجوع إلى المصاريف
            </Link>
          </div>
          <div className="col-12 col-md-4 mb-2">
            <h2 className="text-center py-2 fs-2 fw-bold">أنواع المصاريف</h2>
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
                    <div>
                      <button
                        className="btn btn-outline-info btn-sm rounded-circle ms-2"
                        onClick={() => handleEdit(category)}
                        disabled={isSubmitting}
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button
                        className="btn btn-outline-danger btn-sm rounded-circle"
                        onClick={() => handleDelete(category.id)}
                        disabled={isSubmitting}
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                    <h5 className="card-title mb-0 text-end">
                      {category.name}
                    </h5>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-12 text-center text-danger mt-4">
              لا توجد أنواع مصاريف حالياً.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AddExpenseCategory;
