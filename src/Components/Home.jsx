import React, { useEffect, useState, Suspense } from "react";
import { Link, useNavigate } from "react-router-dom";
import InfoBox from "./InfoBox";
import WelcomeMessage from "./WelcomeMessage";
import HotLink from "./HotLink";
import "react-calendar/dist/Calendar.css";
import HotLinksTitle from "./HotLinksTitle";
import "@fortawesome/fontawesome-free/css/all.css";
import axios from "axios"; // استيراد axios
import Calendar from "./Calendar";

function Home() {
  const navigate = useNavigate();
  const [token, setToken] = useState(null);
  const [sessionsCount, setSessionsCount] = useState(null);
  const [clientsCount, setClientsCount] = useState(null);
  const [remainingAmount, setRemainingAmount] = useState(null);
  const [paidAmount, setPaidAmount] = useState(null);
  const [contractsCount, setContractsCount] = useState(null);
  const [cases, setCases] = useState(null); // تعريف المتغير cases
  const [expensesAmount, setExpensesAmount] = useState(null);
  const [revenueAmount, setRevenueAmount] = useState(null);

  // جلب التوكن من localStorage عند تحميل الصفحة
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (!storedToken) {
      navigate("/SignUp");
    } else {
      setToken(storedToken); // تخزين التوكن في الحالة
    }
  }, [navigate]);

  // تنفيذ الطلب عند الحصول على التوكن
  useEffect(() => {
    if (token) {
      axios
        .get("https://law-office.al-mosa.com/api/home", {
          headers: {
            Authorization: `Bearer ${token}`, // إضافة التوكن في الهيدر
          },
        })
        .then((response) => {
          console.log("Data received from the server:", response.data);
          const data = response.data;

          // تخزين البيانات في المتغيرات
          setSessionsCount(data.sessions || 0);
          setClientsCount(data.customers || 0);
          setRemainingAmount(data.remaining || 0);
          setPaidAmount(data.payments || 0);
          setContractsCount(data.contracts || 0); // إذا كنت تستخدمه هنا
          setCases(data.cases || 0); // استخدام data.cases بدلاً من data.contracts
          setExpensesAmount(data.expenses || 0);
          setRevenueAmount(data.revenue || 0);
        })
        .catch((error) => {
          console.error("Error fetching home data:", error);
        });
    }
  }, [token]);

  // دالة لعرض البيانات أو رسالة عند عدم وجودها
  const displayData = (data) => {
    return data !== null && data !== 0 ? data : "بيانات غير متوفرة";
  };

  return (
    <>
      <div className="container-fluid">
        <div className="row">
          <div className="col-12 my-4">
            <WelcomeMessage message="اهلا ومرحبا بك في برنامج المحامي" />
          </div>
          <div className="col-lg-6 col-12 col-md-7 d-flex align-items-center justify-content-center">
            <div className="card shadow-lg p-3 mb-3">
              <Suspense fallback={<div>جاري تحميل التقويم...</div>}>
                <Calendar />
              </Suspense>
            </div>
          </div>
          <div className="col-lg-6 col-12 col-md-5">
            <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
              <div className="col-lg-4">
                <Link to="/sessions" class="text-decoration-none">
                  <InfoBox
                    title="الجلسات"
                    icon="fa-solid fa-calendar-day fa-2x"
                    value={
                      sessionsCount > 0
                        ? displayData(sessionsCount)
                        : "لا توجد جلسات"
                    }
                    textSize="fs-4" // حجم النص مرتبط بحجم الأيقونة
                  />
                </Link>
              </div>
              <div className="col-xl-4 col-12">
                <Link to="/cases" class="text-decoration-none">
                  <InfoBox
                    title="عدد القضايا"
                    icon="fa-solid fa-scale-balanced fa-2x"
                    value={cases > 0 ? displayData(cases) : "لا توجد قضايا"}
                    textSize="fs-4"
                  />
                </Link>
              </div>
              <div className="col-xl-4 col-12">
                <Link to="/customers" class="text-decoration-none">
                  <InfoBox
                    title="عدد العملاء"
                    icon="fa-solid fa-users fa-2x"
                    value={
                      clientsCount > 0
                        ? displayData(clientsCount)
                        : "لا يوجد عملاء"
                    }
                    textSize="fs-4"
                  />
                </Link>
              </div>
              <div className="col-xl-4 col-12">
                <InfoBox
                  title="اجمالي المتبقي"
                  icon="fa-solid fa-wallet fa-2x"
                  value={
                    remainingAmount > 0
                      ? displayData(remainingAmount)
                      : "لا توجد مبالغ متبقية"
                  }
                  textSize="fs-4"
                />
              </div>
              <div className="col-xl-4 col-12">
                <InfoBox
                  title="اجمالي المدفوع"
                  icon="fa-solid fa-money-bill-wave fa-2x"
                  value={
                    paidAmount > 0
                      ? displayData(paidAmount)
                      : "لا توجد مبالغ مدفوعة"
                  }
                  textSize="fs-4"
                />
              </div>
              <div className="col-xl-4 col-12">
                <InfoBox
                  title="اجمالي العقود"
                  icon="fa-solid fa-file-contract fa-2x"
                  value={
                    contractsCount > 0
                      ? displayData(contractsCount)
                      : "لا توجد عقود مسجلة"
                  }
                  textSize="fs-4"
                />
              </div>
              <div className="col-xl-6 col-12">
                <InfoBox
                  title="المبالغ المتبقية بعد المصروفات"
                  icon="fa-solid fa-calculator fa-2x"
                  value={
                    revenueAmount > 0
                      ? displayData(revenueAmount)
                      : "لا توجد مبالغ متبقية"
                  }
                  textSize="fs-4"
                />
              </div>
              <div className="col-xl-6 col-12">
                <InfoBox
                  title="اجمالي المصروفات"
                  icon="fa-solid fa-chart-line fa-2x"
                  value={
                    expensesAmount > 0
                      ? displayData(expensesAmount)
                      : "لا توجد مصروفات مسجلة"
                  }
                  textSize="fs-4"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="container-fluid">
        <div className="row row-cols-1 row-cols-md-2 g-4 mt-4">
          <div className="col-lg-12 text-end">
            <HotLinksTitle title="روابط سريعه" />
          </div>
          <div className="col-lg-3 col-6">
            <HotLink
              title="الجلسات"
              icon="fa-solid fa-calendar-day"
              link="/sessions"
            />
          </div>
          <div className="col-lg-3 col-6">
            <HotLink
              title="قضيه جديديه"
              icon="fa-solid fa-plus-circle"
              link="/add-case"
            />
          </div>
          <div className="col-lg-3 col-6">
            <HotLink
              title="المصروفات"
              icon="fa-solid fa-credit-card"
              link="/expenses"
            />
          </div>
          <div className="col-lg-3 col-6">
            <HotLink
              title="الإعدادات"
              icon="fa-solid fa-cogs"
              link="/system-settings"
            />
          </div>
        </div>
      </div>
    </>
  );
}

export default Home;
