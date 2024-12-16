import React, { useState, useEffect } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "@fortawesome/fontawesome-free/css/all.css";
import Swal from "sweetalert2";

function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editedExpense, setEditedExpense] = useState(null);

  useEffect(() => {
    const fetchExpenses = async () => {
      Swal.fire({
        title: "جاري تحميل المصروفات...",
        didOpen: () => {
          Swal.showLoading();
        },
      });
      setLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem("token");

        if (!token) {
          setError("Token not found in localStorage.");
          Swal.fire({
            icon: "error",
            title: "فشل",
            text: "لم يتم العثور على الرمز المميز.",
          });
          setLoading(false);
          return;
        }

        const response = await axios.get(
          "https://law-office.al-mosa.com/api/expenses",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log("Response Data:", response.data);

        setExpenses(response.data);
      } catch (err) {
        setError("Error fetching expenses: " + err.message);
        Swal.fire({
          icon: "error",
          title: "فشل",
          text: "فشل في تحميل المصروفات.",
        });
      } finally {
        setLoading(false);
        Swal.close();
      }
    };

    fetchExpenses();
  }, []);

  if (loading) {
    return null; // لا تعرض شيء أثناء التحميل
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  const filteredExpenses = expenses.filter((expense) =>
    expense.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const handleDetails = (expense) => {
    Swal.fire({
      title: "جاري تحميل التفاصيل...",
      didOpen: () => {
        Swal.showLoading();
      },
    });
    setTimeout(() => {
      setSelectedExpense(expense);
      setShowDetailsModal(true);
      Swal.close();
    }, 500);
  };

  const handleDelete = async (id) => {
    Swal.fire({
      title: "هل أنت متأكد من حذف هذا المصروف؟",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "نعم، احذف!",
      cancelButtonText: "إلغاء",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          Swal.fire({
            title: "جاري الحذف...",
            didOpen: () => {
              Swal.showLoading();
            },
          });
          const token = localStorage.getItem("token");
          await axios.delete(
            `https://law-office.al-mosa.com/api/expenses/${id}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          setExpenses((prevExpenses) =>
            prevExpenses.filter((expense) => expense.id !== id)
          );
          Swal.close();
          Swal.fire({
            icon: "success",
            title: "تم الحذف!",
            text: "تم حذف المصروف بنجاح.",
          });
        } catch (err) {
          Swal.fire({
            icon: "error",
            title: "فشل!",
            text: "حدث خطأ أثناء الحذف.",
          });
        }
      }
    });
  };

  const handleEdit = (expense) => {
    setEditedExpense({ ...expense });
    setShowEditModal(true);
    Swal.fire({
      icon: "info",
      title: "تعديل",
      text: "يمكنك الان تعديل المصروف.",
    });
  };
  const handleCloseDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedExpense(null);
    Swal.fire({
      icon: "info",
      title: "تم",
      text: "تم اغلاق تفاصيل المصروف.",
    });
  };
  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditedExpense(null);
    Swal.fire({
      icon: "info",
      title: "تم",
      text: "تم اغلاق تعديل المصروف.",
    });
  };
  const handleEditInputChange = (event) => {
    const { name, value } = event.target;
    setEditedExpense((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };
  const handleSaveEdit = async () => {
    Swal.fire({
      title: "جاري حفظ التعديلات...",
      didOpen: () => {
        Swal.showLoading();
      },
    });
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `https://law-office.al-mosa.com/api/expenses/${editedExpense.id}`,
        editedExpense,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setExpenses((prevExpenses) =>
        prevExpenses.map((exp) =>
          exp.id === editedExpense.id ? { ...editedExpense } : exp
        )
      );
      Swal.close();
      Swal.fire({
        icon: "success",
        title: "تم",
        text: "تم حفظ التعديلات بنجاح",
      });
      handleCloseEditModal();
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "فشل",
        text: "فشل في حفظ التعديلات",
      });
    }
  };

  return (
    <div className="container-fluid  home" dir="rtl">
      {/* إضافة dir="rtl" */}
      <div className="row d-flex align-items-center justify-content-center">
        <div className="col-xl-6 my-4">
          <h1 className="mb-4 text-center">المصروفات</h1>
        </div>
        <div className="col-xl-6 my-4">
          <div className="mb-3 w-50">
            <input
              type="text"
              className="form-control"
              placeholder="ابحث عن مصروف..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>
      <div className="row flex-row-reverse">
        {/* إضافة flex-row-reverse */}
        {filteredExpenses.map((expense) => (
          <div className="col-md-4 mb-4" key={expense.id}>
            <div className="card h-100 case-card" dir="rtl">
              <div className="card-header case-card-header bg-dark text-white d-flex justify-content-between align-items-center">
                <h5 className="card-title m-0 text-start flex-grow-1 ps-2">
                  {expense.name}
                </h5>
                <i className="fas fa-file-invoice fs-4 me-2"></i>
              </div>
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table table-borderless table-sm custom-table">
                    <tbody>
                      <tr>
                        <th scope="row" className="text-end align-middle">
                          <span className="text-bold me-2">الوصف:</span>
                          <i className="fas fa-file-alt ms-1"></i>
                        </th>
                        <td className="text-start align-middle">
                          {expense.description}
                        </td>
                      </tr>
                      <tr>
                        <th scope="row" className="text-end align-middle">
                          <span className="text-bold me-2">المبلغ:</span>
                          <i className="fas fa-coins ms-1"></i>
                        </th>
                        <td className="text-start align-middle">
                          {expense.amount}
                        </td>
                      </tr>
                      <tr>
                        <th scope="row" className="text-end align-middle">
                          <span className="text-bold me-2">التاريخ:</span>
                          <i className="fas fa-calendar-alt ms-1"></i>
                        </th>
                        <td className="text-start align-middle">
                          {expense.date}
                        </td>
                      </tr>
                      <tr>
                        <th scope="row" className="text-end align-middle">
                          <span className="text-bold me-2">الطريقة:</span>
                          <i className="fas fa-hand-holding-usd ms-1"></i>
                        </th>
                        <td className="text-start align-middle">
                          {expense.method}
                        </td>
                      </tr>
                      {expense.notes && (
                        <tr>
                          <th scope="row" className="text-end align-middle">
                            <span className="text-bold me-2">ملاحظات:</span>
                            <i className="fas fa-sticky-note ms-1"></i>
                          </th>
                          <td className="text-start align-middle">
                            {expense.notes}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                <hr className="my-3" />
                <div className="d-flex flex-wrap justify-content-center gap-2 mt-2">
                  <button
                    className="btn btn-info btn-sm case-button"
                    onClick={() => handleDetails(expense)}
                  >
                    <i className="fa fa-info-circle ms-1"></i> تفاصيل
                  </button>
                  <button
                    className="btn btn-danger btn-sm case-button"
                    onClick={() => handleDelete(expense.id)}
                  >
                    <i className="fa fa-trash-alt ms-1"></i> حذف
                  </button>
                  <button
                    className="btn btn-warning btn-sm case-button"
                    onClick={() => handleEdit(expense)}
                  >
                    <i className="fa fa-edit ms-1"></i> تعديل
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* موديل التفاصيل */}
      <div
        className={`modal fade ${showDetailsModal ? "show" : ""}`}
        style={{ display: showDetailsModal ? "block" : "none" }}
        tabIndex="-1"
        aria-labelledby="detailsModalLabel"
        aria-hidden={!showDetailsModal}
      >
        <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="detailsModalLabel">
                تفاصيل المصروف
              </h5>
              <button
                type="button"
                className="btn-close"
                aria-label="Close"
                onClick={handleCloseDetailsModal}
              ></button>
            </div>
            <div className="modal-body">
              {selectedExpense && (
                <div className="table-responsive">
                  <table className="table table-borderless table-sm custom-table">
                    <tbody>
                      <tr>
                        <th scope="row" className="text-end align-middle">
                          <span className="text-bold me-2">الوصف:</span>
                          <i className="fas fa-file-alt ms-1"></i>
                        </th>
                        <td className="text-start align-middle">
                          {selectedExpense.description}
                        </td>
                      </tr>
                      <tr>
                        <th scope="row" className="text-end align-middle">
                          <span className="text-bold me-2">المبلغ:</span>
                          <i className="fas fa-coins ms-1"></i>
                        </th>
                        <td className="text-start align-middle">
                          {selectedExpense.amount}
                        </td>
                      </tr>
                      <tr>
                        <th scope="row" className="text-end align-middle">
                          <span className="text-bold me-2">التاريخ:</span>
                          <i className="fas fa-calendar-alt ms-1"></i>
                        </th>
                        <td className="text-start align-middle">
                          {selectedExpense.date}
                        </td>
                      </tr>
                      <tr>
                        <th scope="row" className="text-end align-middle">
                          <span className="text-bold me-2">الطريقة:</span>
                          <i className="fas fa-hand-holding-usd ms-1"></i>
                        </th>
                        <td className="text-start align-middle">
                          {selectedExpense.method}
                        </td>
                      </tr>
                      {selectedExpense.notes && (
                        <tr>
                          <th scope="row" className="text-end align-middle">
                            <span className="text-bold me-2">ملاحظات:</span>
                            <i className="fas fa-sticky-note ms-1"></i>
                          </th>
                          <td className="text-start align-middle">
                            {selectedExpense.notes}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleCloseDetailsModal}
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* موديل التعديل */}
      <div
        className={`modal fade ${showEditModal ? "show" : ""}`}
        style={{ display: showEditModal ? "block" : "none" }}
        tabIndex="-1"
        aria-labelledby="editModalLabel"
        aria-hidden={!showEditModal}
      >
        <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="editModalLabel">
                تعديل المصروف
              </h5>
              <button
                type="button"
                className="btn-close"
                aria-label="Close"
                onClick={handleCloseEditModal}
              ></button>
            </div>
            <div className="modal-body">
              {editedExpense && (
                <form>
                  <div className="table-responsive">
                    <table className="table table-borderless table-sm custom-table">
                      <tbody>
                        <tr>
                          <th scope="row" className="text-end align-middle">
                            <span className="text-bold me-2">الوصف:</span>
                            <i className="fas fa-file-alt ms-1"></i>
                          </th>
                          <td className="text-start align-middle">
                            <input
                              type="text"
                              className="form-control"
                              name="description"
                              value={editedExpense.description || ""}
                              onChange={handleEditInputChange}
                            />
                          </td>
                        </tr>
                        <tr>
                          <th scope="row" className="text-end align-middle">
                            <span className="text-bold me-2">المبلغ:</span>
                            <i className="fas fa-coins ms-1"></i>
                          </th>
                          <td className="text-start align-middle">
                            <input
                              type="number"
                              className="form-control"
                              name="amount"
                              value={editedExpense.amount || ""}
                              onChange={handleEditInputChange}
                            />
                          </td>
                        </tr>
                        <tr>
                          <th scope="row" className="text-end align-middle">
                            <span className="text-bold me-2">التاريخ:</span>
                            <i className="fas fa-calendar-alt ms-1"></i>
                          </th>
                          <td className="text-start align-middle">
                            <input
                              type="date"
                              className="form-control"
                              name="date"
                              value={editedExpense.date || ""}
                              onChange={handleEditInputChange}
                            />
                          </td>
                        </tr>
                        <tr>
                          <th scope="row" className="text-end align-middle">
                            <span className="text-bold me-2">الطريقة:</span>
                            <i className="fas fa-hand-holding-usd ms-1"></i>
                          </th>
                          <td className="text-start align-middle">
                            <input
                              type="text"
                              className="form-control"
                              name="method"
                              value={editedExpense.method || ""}
                              onChange={handleEditInputChange}
                            />
                          </td>
                        </tr>
                        <tr>
                          <th scope="row" className="text-end align-middle">
                            <span className="text-bold me-2">ملاحظات:</span>
                            <i className="fas fa-sticky-note ms-1"></i>
                          </th>
                          <td className="text-start align-middle">
                            <textarea
                              className="form-control"
                              name="notes"
                              value={editedExpense.notes || ""}
                              onChange={handleEditInputChange}
                            />
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </form>
              )}
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleCloseEditModal}
              >
                إلغاء
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleSaveEdit}
              >
                حفظ
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Expenses;
