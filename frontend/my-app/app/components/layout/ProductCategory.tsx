"use client";  

import React from 'react';  
import { useState } from 'react';  
import Image from "next/image";  

const ProductCategory = () => {  
    const [isOpen, setIsOpen] = useState(false); // State quản lý trạng thái mở/đóng dropdown  

    const toggleDropdown = () => {  
        setIsOpen(!isOpen); // Chuyển đổi trạng thái mở/đóng  
    };  

    return (  
        <div className="container mx-auto p-4">  
            {/* Navbar*/}  
            <nav className="bg-white border-gray-200 dark:bg-gray-900 md:hidden">  
                <div className="max-w-screen-xl flex items-center justify-between mx-auto p-4">    
                    <button   
                        onClick={toggleDropdown}   
                        type="button"   
                        className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-btext-black"   
                        aria-controls="navbar-default"   
                        aria-expanded={isOpen ? 'true' : 'false'}  
                    >  
                        <span className="sr-only">Open main menu</span>  
                        <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 17 14">  
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 1h15M1 7h15M1 13h15"/>  
                        </svg>  
                    </button>  
                </div>  
            </nav>  

                <div className=" rounded-lg p-4"> 
                    <div className="text-center md:text-left">
                        <h2 className="text-xl font-semibold mb-4 hidden md:block">Danh mục</h2>  
                    </div>

                    {/* Phần danh mục */}  
                    <section id="navbar-default" className={`${isOpen ? 'block' : 'hidden'} md:block`}>  
                        <div className="flex flex-col items-center md:flex-row md:flex-wrap md:justify-between">  
                              
                            <div className="flex flex-col items-center mb-4 md:mb-6 md:mx-4">  
                                <Image src="/icon/brand.png" width={40} height={40} alt="Quần áo" />  
                                <p className="text-center text-black">Quần áo</p>  
                            </div>  
                            
                            <div className="flex flex-col items-center mb-4 md:mb-6 md:mx-4">  
                                <Image src="/icon/shoes.png" width={40} height={40} alt="Giày dép" />  
                                <p className="text-center text-black">Giày dép</p>  
                            </div>  
                            
                            <div className="flex flex-col items-center mb-4 md:mb-6 md:mx-4">  
                                <Image src="/icon/hand-watch.png" width={40} height={40} alt="Đồng hồ" />  
                                <p className="text-center text-black">Đồng hồ</p>  
                            </div>  
                            
                            <div className="flex flex-col items-center mb-4 md:mb-6 md:mx-4">  
                                <Image src="/icon/iphone.png" width={40} height={40} alt="Điện thoại" />  
                                <p className="text-center text-black">Điện thoại</p>  
                            </div>  
                             
                            <div className="flex flex-col items-center mb-4 md:mb-6 md:mx-4">  
                                <Image src="/icon/computer.png" width={40} height={40} alt="Máy tính & laptop" />  
                                <p className="text-center text-black">Máy tính & laptop</p>  
                            </div>  
                              
                            <div className="flex flex-col items-center mb-4 md:mb-6 md:mx-4">  
                                <Image src="/icon/keyboard.png" width={40} height={40} alt="Phụ kiện máy tính" />  
                                <p className="text-center text-black">Phụ kiện máy tính</p>  
                            </div>  
                             
                            <div className="flex flex-col items-center mb-4 md:mb-6 md:mx-4">  
                                <Image src="/icon/ram-memory.png" width={40} height={40} alt="Linh kiện điện tử" />  
                                <p className="text-center text-black">Linh kiện điện tử</p>  
                            </div>  
                             
                            <div className="flex flex-col items-center mb-4 md:mb-6 md:mx-4">  
                                <Image src="/icon/point.png" width={40} height={40} alt="Xem thêm" />  
                                <p className="text-center text-black">Xem thêm</p>  
                            </div>   
                        </div>  
                    </section>
                </div>

            </div>

    );  
};  

export default ProductCategory;