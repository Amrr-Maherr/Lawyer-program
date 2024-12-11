import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";

const CustomerCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newCategory, setNewCategory] = useState("");

  const fetchCategories = async () => {
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
    }
  };

  const handleDelete = async (categoryId) => {
    const token = localStorage.getItem("token");
    if (!token) {
      Swal.fire("تحذير", "يرجى تسجيل الدخول أولاً.", "warning");
      return;
    }

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
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  if (loading) {
    return (
      <div className="text-center my-5">
        <div className="spinner-border" role="status"></div>جاري التحميل...
      </div>
    );
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  return (
    <div className="container-fluid px-0 my-4">
      <div className="container">
        <div className="row d-flex align-items-center justify-content-center">
          <div className="col-xl-3 col-6">
            <input
              type="text"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className="form-control"
              placeholder="أدخل نوع العميل الجديد"
            />
          </div>
          <div className="col-xl-3 col-6">
            <button className="btn btn-dark" onClick={handleAddCategory}>
              <i className="fas fa-plus"></i> إضافة نوع عميل جديد
            </button>
          </div>
          <div className="col-xl-6 col-12">
            <h2 className="text-center py-4 fs-2 fw-bold">أنواع العملاء</h2>
          </div>
        </div>
      </div>
      <div className="table-responsive">
        <table className="table table-bordered bg-dark table-striped text-center">
          <thead className="text-white table-dark">
            <tr>
              <th>الإجراءات</th>
              <th>اسم النوع</th>
              <th>#</th>
            </tr>
          </thead>
          <tbody>
            {categories.length > 0 ? (
              categories.map((category, index) => (
                <tr key={category.id}>
                  <td>
                    <button
                      className="btn btn-danger"
                      onClick={() => handleDelete(category.id)}
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </td>
                  <td>{category.name}</td>
                  <td>{index + 1}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="text-center text-danger">
                  لا توجد أنواع عملاء حالياً.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CustomerCategories;