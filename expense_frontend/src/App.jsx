import { useState, useEffect } from 'react'
import { ToastContainer, toast } from 'react-toastify'
import "react-toastify/dist/ReactToastify.css"
import Login from './components/Login'
import Profile from './components/Profile'
import CategoryChart from './CategoryChart'

function App() {
  const [expenses, setExpenses] = useState([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [title, setTitle] = useState("")
  const [amount, setAmount] = useState("")
  const [category, setCategory] = useState("")
  const [editId, setEditId] = useState("")
  const [token, setToken] = useState(
    localStorage.getItem("token") || ""
  )
  const [search, setSearch] = useState("")
  const [filterCategory, setFilterCategory] = useState("")
  const [user, setUser] = useState(null)
  const [showProfile, setShowProfile] = useState(false)
  const [allExpenses, setAllExpenses] = useState([])
  const [summary, setSummary] = useState({
    total: 0,
    food: 0,
    transport: 0,
    entertainment: 0,
    shopping: 0
  })
  const [darkMode, setDarKMode] = useState(
    localStorage.getItem("darkMode") === "true"
  )
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [expenseToDelete, setExpenseToDelete] = useState(null)
  const [showLogoutModal, setShowLogoutModal] = useState(false)

  useEffect(() => {
    if (token && token !== "undefined") {
      let url = `http://localhost:3000/expenses/?page=${page}&title=${search}&category=${filterCategory}`
      fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }).then(res => {
        if (res.status === 401) {
          localStorage.removeItem("token")
          setToken("")
          setUser(null)
          return null
        }
        return res.json()
      })
        .then(data => {
          if (data) {
            setExpenses(data.expenses)
            setTotalPages(data.totalPages)
          }

        })
        .catch(err => console.log(err))
    }

  }, [page, token, search, filterCategory])

  useEffect(() => {
    if (token) {
      fetch("http://localhost:3000/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
        .then(res => {
          if (res.status === 401) {
            localStorage.removeItem("token")
            setToken("")
            setUser(null)
            return null
          }
          return res.json()
        })
        .then(data => {
          if (data) setUser(data)
        })
        .catch(err => {
          console.log(err)
          localStorage.removeItem("token")
          setToken("")
          setUser(null)
        })
    }
  }, [token])

  useEffect(() => {
    if (token) {
      fetch("http://localhost:3000/expenses?all=true", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
        .then(res => res.json())
        .then(data => {
          setAllExpenses(data.expenses || data)
        })
      console.log("Calling summary")
      fetchSummary()
    }
  }, [token])

  useEffect(() => {
    localStorage.setItem("darkMode", darkMode)
  }, [darkMode])

  const handlePrevious = () => {
    if (page !== 1) {
      setPage(page - 1)
    }
  }

  const handleNext = () => {
    if (page < totalPages) {
      setPage(page + 1)
    }
  }

  const handleAdd = async () => {

    if (editId) {
      const res = await fetch(`http://localhost:3000/expenses/${editId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          amount,
          category
        })
      })
      const data = await res.json()
      setExpenses(expenses.map(item =>
        item._id === editId ? data : item
      ))
      setTitle("")
      setAmount("")
      setCategory("")
      setEditId("")
      fetchAllExpenses()
      await fetchSummary()
      toast.success("Expense updated")
    }
    else {
      const res = await fetch("http://localhost:3000/expenses", {
        method: 'POST',
        headers: {
          'Content-Type': "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title,
          amount,
          category
        })
      })
      const data = await res.json()
      console.log(data)
      setExpenses(prev => [...prev, data])
      setTitle("")
      setAmount("")
      setCategory("")
      fetchAllExpenses()
      await fetchSummary()
      toast.success("Expense added")
    }

  }

  const handleDelete = async (_id) => {
    const res = await fetch(`http://localhost:3000/expenses/${_id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    setExpenses(expenses.filter(item => item._id !== _id))

    await fetchAllExpenses()
    await fetchSummary()
    setExpenseToDelete(null)
    setShowDeleteModal(false)
    toast.success("Expense deleted")
  }

  const handleEdit = async (exp) => {
    setTitle(exp.title)
    setAmount(exp.amount)
    setCategory(exp.category)
    setEditId(exp._id)
  }

  const handleLogout = () => {
    console.log("Logout clicked")
    localStorage.removeItem("token")
    setToken("")
    setShowProfile(false)
    setShowLogoutModal(false)
    toast.info("Logged out")
  }

  const categoryData = {
    food: 0,
    transport: 0,
    entertainment: 0,
    shopping: 0
  }

  const totalExpense = (allExpenses || []).reduce((sum, exp) => {
    return sum + Number(exp.amount || 0)
  }, 0)

  allExpenses.forEach((exp) => {
    categoryData[exp.category] += Number(exp.amount)
  })

  const fetchAllExpenses = async () => {
    const res = await fetch("http://localhost:3000/expenses/?all=true", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    if(res.status === 401){
      localStorage.removeItem("token")
      setToken("")
      setUser(null)
      return
    }

    const data = await res.json()
    setAllExpenses(data.expenses)
  }

  const fetchSummary = async () => {
    const res = await fetch("http://localhost:3000/expenses/summary", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    if(res.status === 401){
      localStorage.removeItem("token")
      setToken("")
      setUser(null)
      return
    }
    const data = await res.json()
    setSummary(data)
  }

  const handleSearch = (e) => {
    setSearch(e.target.value)
  }

  const handleCategory = (e) => {
    setCategory(e.target.value)
  }

  const isSearching = search.trim() !== "" || filterCategory !== ""

  const toggleDarkMode = () => {
    setDarKMode(!darkMode)
  }

  return (
    <>
      {showProfile ? (
        <Profile setShowProfile={setShowProfile} setUser={setUser} handleLogout={handleLogout} user={user} token={token} darkMode={darkMode} toggleDarkMode={toggleDarkMode} setShowLogoutModal={setShowLogoutModal}/>
      ) : !token ? (
        <Login setToken={setToken} darkMode={darkMode} />
      ) : (
        <div
          className={
            darkMode
              ? "min-h-screen bg-gray-900 text-white p-6 transition"
              : "min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-6"
          }
        >
          <div className="max-w-4xl mx-auto">

            {/* Header */}
            <div
              className={
                darkMode
                  ? "bg-gray-800 border border-gray-700 backdrop-blur p-5 rounded-2xl shadow-md flex justify-between items-center mb-8 text-white"
                  : "bg-white/80 backdrop-blur p-5 rounded-2xl shadow-md flex justify-between items-center mb-8 border border-gray-200"
              }
            >
              <h1
                className={
                  darkMode
                    ? "text-3xl font-semibold text-white tracking-tight"
                    : "text-3xl font-semibold text-gray-800 tracking-tight"
                }
              >
                Expense Tracker
              </h1>

              <div className="flex items-center gap-3">
                {user && (
                  <button onClick={() => setShowProfile(true)}
                    className="w-9 h-9 rounded-full bg-blue-500 text-white flex items-center justify-center">
                    {user.profilePic ? (
                      <img
                        src={`http://localhost:3000/${user.profilePic}`}
                        alt="profile"
                        className='w-full h-full object-cover rounded-full'
                      />
                    ) : (
                      user.username.charAt(0).toUpperCase()
                    )}
                  </button>
                )}


              </div>
            </div>

            {/* Search */}
            <div
              className={
                darkMode
                  ? "bg-gray-800 p-5 rounded-2xl shadow mb-8 flex gap-3 border border-gray-700"
                  : "bg-white p-5 rounded-2xl shadow mb-8 flex gap-3 border border-gray-200"
              }
            >
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={handleSearch}
                className={
                  darkMode
                    ? "flex-1 bg-gray-700 text-white border border-gray-600 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none placeholder-gray-300"
                    : "flex-1 border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
                }
              />

              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className={
                  darkMode
                    ? "bg-gray-700 text-white border border-gray-600 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
                    : "border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
                }
              >
                <option value="">All</option>
                <option value="food">Food</option>
                <option value="transport">Transport</option>
                <option value="shopping">Shopping</option>
                <option value="entertainment">Entertainment</option>
              </select>
            </div>

            {/* Add */}
            {!isSearching && (
              <>

                <div
                  className={
                    darkMode
                      ? "bg-gray-800 p-4 rounded shadow mb-6 border border-gray-700"
                      : "bg-white p-4 rounded shadow mb-6"
                  }
                >
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Title"
                    className={
                      darkMode
                        ? "w-full bg-gray-700 text-white border border-gray-600 p-2.5 mb-3 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none placeholder-gray-300"
                        : "w-full border border-gray-300 p-2.5 mb-3 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
                    }
                  />

                  <input
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Amount"
                    className={
                      darkMode
                        ? "w-full bg-gray-700 text-white border border-gray-600 p-2.5 mb-4 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none placeholder-gray-300"
                        : "w-full border border-gray-300 p-2.5 mb-4 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
                    }
                  />

                  <div className='flex gap-3 mb-4 flex-wrap'>
                    {["food", "transport", "entertainment", "shopping"].map((cat) => (
                      <label
                        key={cat}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border cursor-pointer text-sm transition
                        ${category === cat
                            ? "bg-blue-500 text-white border-blue-500"
                            : darkMode
                              ? "bg-gray-700 text-white border-gray-600 hover:bg-gray-600"
                              : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"}`}
                      >
                        <input
                          type="radio"
                          name='category'
                          value={cat}
                          checked={category === cat}
                          onChange={(e) => setCategory(e.target.value)}
                          className='mr-1'
                        />
                        {cat}
                      </label>
                    ))}
                  </div>

                  <button
                    onClick={handleAdd}
                    className={
                      darkMode
                        ? "w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-medium transition"
                        : "w-full bg-blue-500 hover:bg-blue-600 text-white py-2.5 rounded-lg font-medium transition"
                    }
                  >
                    {editId ? "Update" : "Add"}
                  </button>
                </div>

                <div
                  className={
                    darkMode
                      ? "bg-gradient-to-r from-blue-700 to-blue-800 text-white p-5 rounded-2xl shadow mb-6 flex justify-between items-center"
                      : "bg-gradient-to-r from-blue-500 to-blue-600 text-white p-5 rounded-2xl shadow mb-6 flex justify-between items-center"
                  }
                >
                  <div>
                    <p className="text-sm opacity-80">Total Spent</p>
                    <h2 className="text-2xl font-bold">₹{summary.total}</h2>
                  </div>
                  <div className="text-3xl">
                    💰
                  </div>

                </div>

                <div
                  className={
                    darkMode
                      ? "bg-gray-800 p-4 rounded-2xl shadow mb-6 border border-gray-700"
                      : "bg-white p-4 rounded-2xl shadow mb-6"
                  }
                >
                  <CategoryChart data={categoryData} darkMode={darkMode} />
                </div>
              </>
            )}
            {/* List */}

            {expenses.map((e) => (
              <div
                key={e._id}
                className={
                  darkMode
                    ? "bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-700 flex justify-between items-center hover:shadow-md transition"
                    : "bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex justify-between items-center hover:shadow-md transition"
                }
              >
                <div>
                  <p className={darkMode ? "font-medium text-white" : "font-medium text-gray-800"}>
                    {e.title}
                  </p>
                  <p className={darkMode ? "font-medium text-white" : "font-medium text-gray-800"}>
                    ₹{e.amount}
                  </p>
                </div>

                <div className="flex gap-2">
                  <button className="bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-1 rounded-md text-sm" onClick={() => handleEdit(e)}>Edit</button>
                  <button className="bg-red-400 hover:bg-red-500 text-white px-3 py-1 rounded-md text-sm" onClick={() => {
                    setShowDeleteModal(true)
                    setExpenseToDelete(e._id)
                  }}>Delete</button>
                </div>
              </div>
            ))}



            {/* Pagination */}
            <div
              className={
                darkMode
                  ? "flex justify-between items-center mt-8 bg-gray-800 p-4 rounded-xl shadow border border-gray-700"
                  : "flex justify-between items-center mt-8 bg-white p-4 rounded-xl shadow border border-gray-200"
              }
            >
              <button className={
                darkMode
                  ? "bg-gray-700 hover:bg-gray-600 text-white px-4 py-1.5 rounded-md text-sm"
                  : "bg-gray-200 hover:bg-gray-300 px-4 py-1.5 rounded-md text-sm"
              } onClick={handlePrevious}>Prev</button>
              <p
                className={
                  darkMode
                    ? "text-sm text-gray-300"
                    : "text-sm text-gray-600"
                }
              > Page <span className="font-medium">{page}</span> of{" "}
                <span className="font-medium">{totalPages || 1}</span></p>
              <button className={
                darkMode
                  ? "bg-gray-700 hover:bg-gray-600 text-white px-4 py-1.5 rounded-md text-sm"
                  : "bg-gray-200 hover:bg-gray-300 px-4 py-1.5 rounded-md text-sm"
              } onClick={handleNext}>Next</button>
            </div>

          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div
            className={
              darkMode
                ? "bg-gray-800 text-white p-6 rounded-xl shadow-xl w-80 border border-gray-700"
                : "bg-white p-6 rounded-xl shadow-xl w-80"
            }
          >
            <h2 className='text-xl font-semibold mb-3'>
              Delete Expense
            </h2>
            <p
              className={
                darkMode
                  ? "text-gray-300 mb-5"
                  : "text-gray-600 mb-5"
              }
            >
              Are you sure you want to delete this expense?
            </p>
            <div className="flex justify-end gap-3">
              <button   
                onClick={() => setShowDeleteModal(false)}
                className={
                  darkMode
                    ? "bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition"
                    : "bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-lg transition"
                }
              >
                Cancel
              </button>
              <button
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition" 
                onClick={()=> handleDelete(expenseToDelete)}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {showLogoutModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div
                        className={
                            darkMode
                                ? "bg-gray-800 text-white p-6 rounded-xl shadow-xl w-80 border border-gray-700"
                                : "bg-white p-6 rounded-xl shadow-xl w-80"
                        }
                    >
                        <h2 className='text-xl font-semibold mb-3'>
                            Logout
                        </h2>
                        <p
                            className={
                                darkMode
                                    ? "text-gray-300 mb-5"
                                    : "text-gray-600 mb-5"
                            }
                        >
                            Are you sure you want to logout?
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowLogoutModal(false)}
                                className={
                                    darkMode
                                        ? "bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition"
                                        : "bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-lg transition"
                                }
                            >
                                Cancel
                            </button>
                            <button
                                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition"
                                onClick={handleLogout}
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            )}

      <ToastContainer
        position='top-right'
        autoClose={3000}
      />
    </>
  );
}

export default App
