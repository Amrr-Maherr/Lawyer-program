import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "@fortawesome/fontawesome-free/css/all.min.css";

import "./App.css";

// Components
import NavBar from "./Components/NavBar";
import Home from "./Components/Home";
import Cases from "./Components/Cases";
import SingleCase from "./Components/SingleCase";
import AddCase from "./Components/AddCase";
import Sessions from "./Components/Sessions";
import Payments from "./Components/Payments";
import Attachments from "./Components/attachments";
import LogIn from "./Components/LogIn";
import SignUp from "./Components/SignUp";
import Customers from "./Components/Customers";
import Expenses from "./Components/Expenses";
import SystemSettings from "./Components/SystemSettings";
import CaseTypes from "./Components/CasesTypes";
import AddCustomer from "./Components/AddCustomer";
import ResetPassword from "./Components/ResetPassword";
import CustomerCategories from "./Components/CustomerCategories";
import PaymentReports from "./Components/PaymentReports";
import ForgotPassword from "./Components/ForgotPassword";
import AddExpense from "./Components/AddExpense.jsx";
import AddExpenseCategory from "./Components/AddExpenseCategory.jsx";

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Routes>
          <Route
            path="/"
            element={
              <>
                <NavBar />
                <Home />
              </>
            }
          />
          <Route
            path="cases"
            element={
              <>
                <NavBar />
                <Cases />
              </>
            }
          />
          <Route
            path="/case-details/:customerId/:caseId"
            element={
              <>
                <NavBar />
                <SingleCase />
              </>
            }
          />
          <Route
            path="/add-case"
            element={
              <>
                <NavBar />
                <AddCase />
              </>
            }
          />
          <Route
            path="sessions"
            element={
              <>
                <NavBar />
                <Sessions />
              </>
            }
          />
          <Route
            path="PaymentReports"
            element={
              <>
                <NavBar />
                <PaymentReports />
              </>
            }
          />
          <Route
            path="payments"
            element={
              <>
                <NavBar />
                <Payments />
              </>
            }
          />
          <Route
            path="Attachments"
            element={
              <>
                <NavBar />
                <Attachments />
              </>
            }
          />
          <Route
            path="/customers"
            element={
              <>
                <NavBar />
                <Customers />
              </>
            }
          />
          <Route
            path="/expenses"
            element={
              <>
                <NavBar />
                <Expenses />
              </>
            }
          />
          <Route
            path="/add-expense"
            element={
              <>
                <NavBar />
                <AddExpense />
              </>
            }
          />
          <Route
            path="/AddExpenseCategory"
            element={
              <>
                <NavBar />
                <AddExpenseCategory />
              </>
            }
          />
          <Route
            path="/system-settings"
            element={
              <>
                <NavBar />
                <SystemSettings />
              </>
            }
          />
          <Route path="/login" element={<LogIn />} />
          <Route
            path="/CaseTypes"
            element={
              <>
                <NavBar />
                <CaseTypes />
              </>
            }
          />
          <Route
            path="/ResetPassword"
            element={
              <>
                <ResetPassword />
              </>
            }
          />
          <Route
            path="/AddCustomer"
            element={
              <>
                <NavBar />
                <AddCustomer />
              </>
            }
          />
          <Route path="/SignUp" element={<SignUp />} />
          <Route path="/ForgotPassword" element={<ForgotPassword />} />
          <Route
            path="/customer-categories"
            element={
              <>
                <NavBar />
                <CustomerCategories />
              </>
            }
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
