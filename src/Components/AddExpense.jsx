import React, { useState, useEffect } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import "@fortawesome/fontawesome-free/css/all.css";

function AddExpense() {
  const [formData, setFormData] = useState({
    expenseName: "",
    expenseAmount: "",
    expenseMethod: "",
    expenseCategoryId: "",
    expenseNotes: "",
    expenseDate: "",
    expenseDescription: "",
  });
  const [serverCategories, setServerCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      Swal.fire("تحذير", "يرجى تسجيل الدخول أولاً.", "warning", { rtl: true });
      setLoading(false);
      return;
    }
    try {
      const response = await axios.get(
        "https://law-office.al-mosa.com/api/expense-categories",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.status === 200) {
        if (response.data && response.data) {
          setServerCategories(response.data);
        } else {
          setServerCategories([]);
        }
      } else {
        Swal.fire("حدث خطأ", "فشلت جلب أنواع المصروفات", "error", {
          rtl: true,
        });
      }
    } catch (error) {
      console.error("Error fetching expense categories:", error);
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        Swal.fire("حدث خطأ", error.response.data.message, "error", {
          rtl: true,
        });
      } else {
        Swal.fire("حدث خطأ", "فشلت جلب أنواع المصروفات", "error", {
          rtl: true,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [id]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await handleAddExpense();
  };

  const handleAddExpense = async () => {
    const token = localStorage.getItem("token");
    setIsSubmitting(true);
    setLoading(true);
    if (!token) {
      Swal.fire("تحذير", "يرجى تسجيل الدخول أولاً.", "warning", { rtl: true });
      setIsSubmitting(false);
      setLoading(false);
      return;
    }
    // التحقق من أن جميع الحقول غير فارغة
    const allFieldsFilled = Object.values(formData).every(
      (value) => value !== ""
    );
    if (!allFieldsFilled) {
      Swal.fire("تحذير", "يرجى تعبئة جميع الحقول أولاً.", "warning", {
        rtl: true,
      });
      setIsSubmitting(false);
      setLoading(false);
      return;
    }
    const categoryId = Number(formData.expenseCategoryId);
    try {
      const response = await axios.post(
        "https://law-office.al-mosa.com/api/store-expense",
        {
          name: formData.expenseName,
          amount: formData.expenseAmount,
          method: formData.expenseMethod,
          category_id: categoryId,
          notes: formData.expenseNotes,
          date: formData.expenseDate,
          description: formData.expenseDescription,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.status === 201) {
        await Swal.fire(
          "تم الإضافة بنجاح!",
          "تمت إضافة المصروف بنجاح.",
          "success",
          { rtl: true }
        ).then(() => {
          navigate("/expenses");
          resetForm();
        });
      } else {
        Swal.fire(
          "حدث خطأ",
          "فشلت إضافة المصروف، يرجى المحاولة مرة أخرى.",
          "error",
          { rtl: true }
        );
      }
    } catch (error) {
      console.error("Error adding expense:", error);
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        Swal.fire("حدث خطأ", error.response.data.message, "error", {
          rtl: true,
        });
      } else {
        Swal.fire(
          "حدث خطأ",
          "فشلت إضافة المصروف، يرجى المحاولة مرة أخرى.",
          "error",
          { rtl: true }
        );
      }
    } finally {
      setIsSubmitting(false);
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      expenseName: "",
      expenseAmount: "",
      expenseMethod: "",
      expenseCategoryId: "",
      expenseNotes: "",
      expenseDate: "",
      expenseDescription: "",
    });
  };
  if (loading) {
    Swal.fire({
      title: "جاري تحميل...",
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => {
        Swal.showLoading();
      },
      rtl: true,
    });
  } else {
    Swal.close();
  }

  if (error) {
    return null;
  }

  return (
    <div
      className="container mt-5"
      style={{ backgroundColor: "#f0f0f0" }}
      dir="rtl"
    >
      <div className="row align-items-start justify-content-center mb-4">
        <div className="col-12 col-md-4 mb-2">
          <h2
            className="text-center py-2 fs-2 fw-bold"
            style={{ color: "#1a237e" }}
          >
            إضافة مصروف
          </h2>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="text-end">
        <div className="row">
          <div className="col-md-6 mb-3">
            <label htmlFor="expenseName" className="form-label custom-label">
              اسم المصروف
            </label>
            <input
              type="text"
              className="form-control custom-input text-end"
              id="expenseName"
              value={formData.expenseName}
              onChange={handleInputChange}
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
          <div className="col-md-6 mb-3">
            <label htmlFor="expenseAmount" className="form-label custom-label">
              المبلغ
            </label>
            <input
              type="number"
              className="form-control custom-input text-end"
              id="expenseAmount"
              value={formData.expenseAmount}
              onChange={handleInputChange}
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
        </div>
        <div className="row">
          <div className="col-md-6 mb-3">
            <label htmlFor="expenseMethod" className="form-label custom-label">
              طريقة الدفع
            </label>
            <input
              type="text"
              className="form-control custom-input text-end"
              id="expenseMethod"
              value={formData.expenseMethod}
              onChange={handleInputChange}
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
          <div className="col-md-6 mb-3">
            <label
              htmlFor="expenseCategoryId"
              className="form-label custom-label"
            >
              نوع المصروف
            </label>
            {loading ? (
              <p>جاري تحميل أنواع المصروفات...</p>
            ) : (
              <select
                className="form-control custom-input text-end"
                id="expenseCategoryId"
                value={formData.expenseCategoryId}
                onChange={handleInputChange}
                style={{
                  borderWidth: "2px",
                  borderColor: "#64b5f6",
                  boxShadow: "0 0 5px rgba(0, 0, 0, 0.1)",
                  fontSize: "1rem",
                  padding: "10px",
                  transition: "border-color 0.3s ease",
                }}
              >
                <option value="">-- اختر نوع المصروف --</option>
                {serverCategories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>
        <div className="mb-3">
          <label htmlFor="expenseNotes" className="form-label custom-label">
            ملاحظات
          </label>
          <textarea
            className="form-control custom-input text-end"
            id="expenseNotes"
            value={formData.expenseNotes}
            onChange={handleInputChange}
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
        <div className="row">
          <div className="col-md-6 mb-3">
            <label htmlFor="expenseDate" className="form-label custom-label">
              تاريخ المصروف
            </label>
            <input
              type="date"
              className="form-control custom-input text-end"
              id="expenseDate"
              value={formData.expenseDate}
              onChange={handleInputChange}
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
          <div className="col-md-6 mb-3">
            <label
              htmlFor="expenseDescription"
              className="form-label custom-label"
            >
              الوصف
            </label>
            <textarea
              className="form-control custom-input text-end"
              id="expenseDescription"
              value={formData.expenseDescription}
              onChange={handleInputChange}
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
        </div>
        <div className="d-grid">
          <button
            type="submit"
            className="btn custom-button"
            disabled={isSubmitting}
            style={{ backgroundColor: "#1a237e", color: "#fff" }}
          >
            إضافة مصروف
          </button>
        </div>
      </form>
      <style>
        {`
         .custom-title {
          color: #3498db;
        }
         .custom-add-button {
          margin-bottom: 15px;
          border-radius: 5px;
          padding: 10px 20px;
          font-weight: bold;
        }
        .custom-add-button:focus {
          box-shadow: none;
        }
        .custom-label {
           font-size: 1.25rem; /* مطابقة لحجم الخط في إضافة القضية */
           font-weight: bold;
          color: #333;
          margin-bottom: 0.5rem;
          display: block;
        }
        .custom-input {
             border: 2px solid #64b5f6;
             box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);
              padding: 10px;
                transition: border-color 0.3s ease;
                 font-size: 1rem;
            background-color: white;
             color: #444;
            margin-bottom: 1rem;
             border-radius: 0.375rem;
        }
        .custom-input:focus {
           border-color: #86b7fe;
            outline: 0;
          box-shadow: 0 0 0 0.25rem rgba(13,110,253,.25);
        }
         .custom-button {
              background-color: #1a237e;
            color: white;
            border: none;
            border-radius: 0.375rem;
             padding: 10px 20px;
            font-weight: bold;
            transition: background-color 0.3s ease-in-out, transform 0.2s ease-in-out;
             box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
               font-size: 1.1rem;
        }
        .custom-button:hover {
          background-color: #555;
          transform: translateY(-2px);
        }
      `}
      </style>
    </div>
  );
}

export default AddExpense;
