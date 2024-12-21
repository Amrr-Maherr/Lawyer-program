import React, { useState, useEffect } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import Swal from "sweetalert2";
import { useNavigate, Link } from "react-router-dom";

function AddExpenseCategory() {
  const [name, setName] = useState("");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");

  const checkToken = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      Swal.fire("تحذير", "يرجى تسجيل الدخول أولاً.", "warning");
      return false;
    }
    return token;
  };

  const fetchCategories = async () => {
    setLoading(true);
    const token = checkToken();
    if (!token) {
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
      handleApiError("Error fetching categories", err);
    } finally {
      setLoading(false);
      Swal.close(); // اغلاق رسالة التحميل عند الانتهاء
    }
  };

  const handleApiError = (message, error) => {
    console.error(message, error);
    if (error.response && error.response.data && error.response.data.message) {
      if (
        error.response.data.message.includes("foreign key constraint fails")
      ) {
        Swal.fire({
          title: "تحذير",
          text: "هذا النوع مرتبط بمصروفات، يرجى حذف المصروفات المرتبطة أولاً.",
          icon: "warning",
          confirmButtonText: "حسناً",
        });
        return; // عدم عرض رسالة الخطأ العامة
      } else {
        Swal.fire("حدث خطأ", error.response.data.message, "error");
        setErrorMessage(error.response.data.message);
      }
    } else if (error.message === "Network Error") {
      Swal.fire(
        "حدث خطأ",
        "خطأ في الشبكة. يرجى التحقق من الاتصال بالإنترنت والمحاولة مرة أخرى.",
        "error"
      );
    } else {
      Swal.fire("حدث خطأ", "فشل في العملية، يرجى المحاولة مرة أخرى.", "error");
      setErrorMessage("فشل في العملية، يرجى المحاولة مرة أخرى.");
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleDelete = async (categoryId) => {
    const token = checkToken();
    if (!token) {
      return;
    }

    setIsSubmitting(true);
    try {
      // First, try to delete the category
      await axios.delete(
        `https://law-office.al-mosa.com/api/expense-category/${categoryId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      Swal.fire("تم الحذف بنجاح", "تم حذف نوع المصروف بنجاح.", "success").then(
        () => {
          // Update categories state immediately
          setCategories(
            categories.filter((category) => category.id !== categoryId)
          );
        }
      );
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        if (
          err.response.data.message.includes("foreign key constraint fails")
        ) {
          Swal.fire({
            title: "تحذير",
            text: "هذا النوع مرتبط بمصروفات، يرجى حذف المصروفات المرتبطة أولاً.",
            icon: "warning",
            confirmButtonText: "حسناً",
          });
        } else {
          handleApiError("Error deleting category", err);
        }
      } else {
        handleApiError("Error deleting category", err);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!name.trim()) {
      Swal.fire("تحذير", "يرجى تعبئة الحقل أولاً.", "warning");
      return;
    }
    setIsSubmitting(true);
    const token = checkToken();
    if (!token) {
      setIsSubmitting(false);
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
          confirmButtonColor: "#3085d6",
          confirmButtonText: "حسناً",
        }).then(() => {
          setName("");
          setErrorMessage("");
          fetchCategories();
        });
      } else {
        handleApiError("Failed to add category", { response: response });
      }
    } catch (error) {
      handleApiError("Error adding expense category", error);
    } finally {
      setIsSubmitting(false);
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
      rtl: true,
    });
  }

  return (
    <div
      className="container-fluid px-0 my-4"
      style={{ backgroundColor: "#f0f0f0" }}
    >
      <div className="container">
        <div className="row align-items-center justify-content-center mb-4">
          <div className="col-12 col-md-4 mb-2">
            <label
              htmlFor="categoryNameInput"
              className="form-label"
              style={{ color: "#444" }}
            >
              نوع المصروف
            </label>
            <input
              type="text"
              id="categoryNameInput"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="form-control form-control-lg rounded-3 shadow-sm custom-input"
              placeholder="أدخل نوع المصروف الجديد"
            />
          </div>
          <div className="col-12 col-md-4 mb-2">
            <button
              className="btn btn-primary btn-lg w-100 d-flex align-items-center justify-content-center custom-button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              style={{
                backgroundColor: "#0d6efd",
                color: "#fff",
                boxShadow: "0 0 5px rgba(13,110,253,.5)",
              }}
            >
              {isSubmitting ? (
                "جاري الحفظ"
              ) : (
                <>
                  <i className="fas fa-plus me-2"></i> إضافة نوع مصروف جديد
                </>
              )}
            </button>
          </div>
          <div className="col-12 col-md-4 mb-2">
            <Link
              to="/expenses"
              className="btn btn-secondary btn-lg w-100 d-flex align-items-center justify-content-center custom-button"
              style={{ boxShadow: "0 0 5px rgba(108,117,125,.5)" }}
            >
              <i className="fas fa-arrow-left me-2"></i> الرجوع إلى المصاريف
            </Link>
          </div>
          <div className="col-12 col-md-4 mb-2">
            <h2
              className="text-center py-2 fs-2 fw-bold"
              style={{ color: "#1a237e" }}
            >
              أنواع المصاريف
            </h2>
          </div>
        </div>
        {errorMessage && (
          <div className="text-danger text-center">{errorMessage}</div>
        )}
      </div>

      <div className="container">
        <div className="row">
          {categories.length > 0 ? (
            categories.map((category) => (
              <div
                key={category.id}
                className="col-12 col-sm-6 col-md-4 col-lg-3 mb-4"
              >
                <div
                  className="card shadow-sm border h-100"
                  style={{ backgroundColor: "white" }}
                >
                  <div className="card-body d-flex justify-content-between align-items-center">
                    <div>
                      <button
                        className="btn btn-outline-danger btn-sm rounded-circle custom-edit-button"
                        onClick={() => handleDelete(category.id)}
                        style={{ color: "#dc3545", borderColor: "#dc3545" }}
                        disabled={isSubmitting}
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                    <h5
                      className="card-title mb-0 text-end"
                      style={{ color: "#444" }}
                    >
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
      <style>
        {`
           .custom-input {
            border: 2px solid #64b5f6;
            box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);
             padding: 10px;
                transition: border-color 0.3s ease;
                 font-size: 1rem;
                  background-color: white;
                    color: #444;
                     border-radius: 0.375rem;
          }
          .custom-input:focus {
            border-color: #86b7fe;
            outline: 0;
            box-shadow: 0 0 0 0.25rem rgba(13,110,253,.25);
          }
           .custom-button {
             border-radius: 0.375rem;
            padding: 0.25rem 0.5rem;
           }
          .custom-button:focus {
            outline: 0;
            box-shadow: 0 0 0 0.25rem rgba(13,110,253,.25);
           }
          .custom-edit-button {
            border-radius: 50%;
             padding: 0.3rem;
          }
          .custom-edit-button:focus {
            outline: 0;
            box-shadow: 0 0 0 0.25rem rgba(13,110,253,.25);
           }
        `}
      </style>
    </div>
  );
}

export default AddExpenseCategory;
