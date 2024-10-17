"use client";

import { useState } from "react";

export default function HomePage() {
    const [barcode, setBarcode] = useState("");
    const [product, setProduct] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [purchaseList, setPurchaseList] = useState([]);
    const [totalAmount, setTotalAmount] = useState(0);

    // Function to open the camera and scan barcode
    const openCamera = async () => {
        try {
            const barcodeData = await scanBarcodeWithCamera();
            setBarcode(barcodeData);
            searchProduct(barcodeData); // Automatically search product after scanning
        } catch (error) {
            console.error("バーコードの読み取りに失敗しました:", error);
            alert("バーコードの読み取りに失敗しました");
        }
    };

    // Example function to simulate scanning (replace this with actual scanning implementation)
    const scanBarcodeWithCamera = () => {
        return new Promise((resolve, reject) => {
            // Logic to open the camera and scan the barcode goes here
            setTimeout(() => {
                const mockBarcode = "1234567890"; // Simulate a scanned barcode
                resolve(mockBarcode);
            }, 2000); // Simulate a delay
        });
    };

    // Function to search for product based on barcode
    const searchProduct = async (barcode) => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/search_product/${barcode}`);
            if (!response.ok) {
                throw new Error("商品情報を取得できませんでした");
            }
            const data = await response.json();
            if (data.error) {
                setProduct(null);
                alert("商品がマスタ未登録です");
            } else {
                setProduct(data);
            }
        } catch (error) {
            console.error("エラー:", error);
            alert("商品情報の取得に失敗しました");
        }
    };

    // Function to add product to purchase list
    const addToPurchaseList = () => {
        if (product) {
            const newItem = { ...product, quantity };
            setPurchaseList([...purchaseList, newItem]);
            setTotalAmount(totalAmount + product.price * quantity);
            setProduct(null); // Clear product
            setBarcode(""); // Clear barcode
        }
    };

    const handlePurchase = async () => {
        const items = purchaseList.map(item => ({ code: item.code, quantity: item.quantity }));
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/purchase`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ items })
        });
        const data = await response.json();
        alert(`購入金額: ${data.total_amount}円`);
        setPurchaseList([]);
        setTotalAmount(0);
    };

    return (
        <div className="container mx-auto p-4 max-w-md bg-white shadow-lg rounded-lg">
            <button
                onClick={openCamera}
                className="w-full bg-blue-500 text-white py-2 mt-2 rounded-md"
            >
                スキャン（カメラ）
            </button>

            {product ? (
                <div className="mt-4 p-4 bg-gray-100 rounded-md text-black">
                    <p className="font-bold text-lg">商品情報</p>
                    <p>商品名: {product.name}</p>
                    <p>価格: {product.price}円</p>
                    <input
                        type="number"
                        value={quantity}
                        onChange={(e) => setQuantity(Number(e.target.value))}
                        min="1"
                        className="w-full border border-gray-300 p-2 rounded-md mt-2"
                    />
                    <button
                        onClick={addToPurchaseList}
                        className="w-full bg-green-500 text-black py-2 mt-2 rounded-md"
                    >
                        購入リストに追加
                    </button>
                </div>
            ) : (
                <p className="text-red-500 mt-4">商品がマスタ未登録です</p>
            )}

            <div className="mt-4">
                <h2 className="font-bold text-black">購入リスト</h2>
                <ul className="bg-gray-100 p-4 rounded-md text-black">
                    {purchaseList.map((item, index) => (
                        <li key={index} className="border-b py-2">
                            {item.name} x {item.quantity} - {item.price * item.quantity}円
                        </li>
                    ))}
                </ul>
                <p className="mt-2 font-bold text-black">合計金額: {totalAmount}円</p>
                <button
                    onClick={handlePurchase}
                    className="w-full bg-red-500 text-white py-2 mt-2 rounded-md"
                >
                    購入
                </button>
            </div>
        </div>
    );
}
