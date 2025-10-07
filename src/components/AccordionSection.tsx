// "use client";
// import { useState } from "react";

// interface Field {
//   name: string;
//   label: string;
//   type?: string;
//   placeholder?: string;
// }

// interface AccordionSectionProps {
//   title: string;
//   fields: Field[];
//   addButtonLabel?: string;
// }

// export default function AccordionSection({
//   title,
//   fields,
//   addButtonLabel = "Add Entry",
// }: AccordionSectionProps) {
//   const [items, setItems] = useState([Object.fromEntries(fields.map(f => [f.name, ""]))]);
//   const [openIndex, setOpenIndex] = useState<number | null>(0);

//   const toggleAccordion = (index: number) =>
//     setOpenIndex(openIndex === index ? null : index);

//   const handleChange = (index: number, field: string, value: string) => {
//     const updated = [...items];
//     updated[index][field] = value;
//     setItems(updated);
//   };

//   const handleAdd = () => {
//     setItems([...items, Object.fromEntries(fields.map(f => [f.name, ""]))]);
//   };

//   const handleReset = (index: number) => {
//     const updated = [...items];
//     updated[index] = Object.fromEntries(fields.map(f => [f.name, ""]));
//     setItems(updated);
//   };

//   return (
//     <div className="bg-[#f5f5f5] p-6 rounded-xl shadow-md border border-gray-200 mb-6">
//       <h2 className="text-xl font-semibold mb-4">{title}</h2>

//       {items.map((item, index) => (
//         <div
//           key={index}
//           className="border border-gray-300 rounded-xl mb-3 bg-white shadow-sm"
//         >
//           <button
//             onClick={() => toggleAccordion(index)}
//             className="w-full text-left px-4 py-3 font-medium flex justify-between items-center"
//           >
//             <span>
//               {Object.values(item).some(v => v)
//                 ? `${title} ${index + 1}`
//                 : `${title} ${index + 1}`}
//             </span>
//             <span>{openIndex === index ? "▲" : "▼"}</span>
//           </button>

//           {openIndex === index && (
//             <div className="px-4 pb-4 pt-2 space-y-3 border-t border-gray-200">
//               {fields.map((field, fIndex) => (
//                 <div key={fIndex}>
//                   {field.type === "textarea" ? (
//                     <textarea
//                       placeholder={field.placeholder || field.label}
//                       value={item[field.name]}
//                       onChange={(e) =>
//                         handleChange(index, field.name, e.target.value)
//                       }
//                       className="w-full border p-2 rounded-md"
//                     />
//                   ) : (
//                     <input
//                       type={field.type || "text"}
//                       placeholder={field.placeholder || field.label}
//                       value={item[field.name]}
//                       onChange={(e) =>
//                         handleChange(index, field.name, e.target.value)
//                       }
//                       className="grid grid-cols-1 md:grid-cols-3 gap-4"
//                     />
//                   )}
//                 </div>
//               ))}

//               <div className="flex justify-end">
//                 <button
//                   onClick={() => handleReset(index)}
//                   className="text-sm border border-gray-400 text-gray-600 px-3 py-1 rounded-md hover:bg-gray-100"
//                 >
//                   Reset
//                 </button>
//               </div>
//             </div>
//           )}
//         </div>
//       ))}

//       <button
//         onClick={handleAdd}
//         className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
//       >
//         + {addButtonLabel}
//       </button>
//     </div>
//   );
// }
