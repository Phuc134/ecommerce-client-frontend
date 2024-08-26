import { React, useEffect, useState } from "react";
import CustomInput from "../components/CustomInput";
import ReactQuill from "react-quill";
import { useNavigate } from "react-router-dom";
import "react-quill/dist/quill.snow.css";
import { toast } from "react-toastify";
import * as yup from "yup";
import { useFormik } from "formik";
import { useDispatch, useSelector } from "react-redux";
import { getBrands } from "../features/brand/brandSlice";
import { getCategories } from "../features/pcategory/pcategorySlice";
import { getColors } from "../features/color/colorSlice";
import { Select } from "antd";
import Dropzone from "react-dropzone";
import { delImg, uploadImg } from "../features/upload/uploadSlice";
import { createProducts, getAProduct, resetState, updateAProduct } from "../features/product/productSlice";

let schema = yup.object().shape({
  title: yup.string().required("Title is Required"),
  description: yup.string().required("Description is Required"),
  price: yup.number().required("Price is Required"),
  brand: yup.string().required("Brand is Required"),
  category: yup.string().required("Category is Required"),
  tags: yup.string().required("Tag is Required"),
  color: yup
      .array()
      .min(1, "Pick at least one color")
      .required("Color is Required"),
  quantity: yup.number().required("Quantity is Required"),
});

const AddProduct = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const getProductId = window.location.pathname.split("/")[3];
  const [color, setColor] = useState([]);
  const [imgState, setImgState] = useState([]);

  const brandState = useSelector((state) => state.brand.brands);
  const catState = useSelector((state) => state.pCategory.pCategories);
  const colorState = useSelector((state) => state.color.colors);
  const productState = useSelector((state) => state.product);
  const {
    isSuccess,
    isError,
    isLoading,
    createdProduct,
    updatedProduct,
    productName,
    productDesc,
    productPrice,
    productBrand,
    productCategory,
    productTags,
    productColor,
    productQuantity,
    productImages,
  } = productState;

  useEffect(() => {
    dispatch(resetState());
    dispatch(getBrands());
    dispatch(getCategories());
    dispatch(getColors());
    if (getProductId !== undefined) {
      dispatch(getAProduct(getProductId));
    }
  }, [dispatch, getProductId]);

  useEffect(() => {
    if (getProductId !== undefined && productImages) {
      setImgState(productImages); // Initialize imgState with productImages when editing
    }
  }, [productImages, getProductId]);

  useEffect(() => {
    if (isSuccess && createdProduct) {
      toast.success("Product Added Successfully!");
      navigate("/admin/list-product");
    }
    if (isSuccess && updatedProduct) {
      toast.success("Product Updated Successfully!");
      navigate("/admin/list-product");
    }
    if (isError) {
      toast.error("Something Went Wrong!");
    }
  }, [isSuccess, isError, createdProduct, updatedProduct, navigate]);

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      title: productName || "",
      description: productDesc || "",
      price: productPrice || "",
      brand: productBrand || "",
      category: productCategory || "",
      tags: productTags || "",
      color: productColor || [],
      quantity: productQuantity || "",
      images: productImages || [], // Initialize formik values with productImages when editing
    },
    validationSchema: schema,
    onSubmit: (values) => {
      values.images = imgState; // Use the current imgState as the images field value

      if (getProductId !== undefined) {
        const data = { id: getProductId, productData: values };
        dispatch(updateAProduct(data));
      } else {
        dispatch(createProducts(values));
        formik.resetForm();
        setColor([]);
      }
      dispatch(resetState());
      dispatch(delImg());
    },
  });

  const handleColors = (selectedColors) => {
    const selectedColorObjects = selectedColors.map((id) =>
        colorState.find((color) => color._id === id)
    );
    setColor(selectedColorObjects);
    formik.setFieldValue("color", selectedColorObjects);
  };

  const handleDrop = (acceptedFiles) => {
    dispatch(uploadImg(acceptedFiles)).then((action) => {
      if (action.meta.requestStatus === "fulfilled") {
        setImgState((prev) => [...prev, ...action.payload]); // Add uploaded images to imgState
      }
    });
  };


  return (
      <div>
        <h3 className="mb-4 title">
          {getProductId !== undefined ? "Edit" : "Add"} Product
        </h3>
        <div>
          <form
              onSubmit={formik.handleSubmit}
              className="d-flex gap-3 flex-column"
          >
            <CustomInput
                type="text"
                label="Enter Product Title"
                name="title"
                onChng={formik.handleChange("title")}
                onBlr={formik.handleBlur("title")}
                val={formik.values.title}
            />
            <div className="error">
              {formik.touched.title && formik.errors.title}
            </div>
            <div className="">
              <ReactQuill
                  theme="snow"
                  name="description"
                  onChange={formik.handleChange("description")}
                  value={formik.values.description}
              />
            </div>
            <div className="error">
              {formik.touched.description && formik.errors.description}
            </div>
            <CustomInput
                type="number"
                label="Enter Product Price"
                name="price"
                onChng={formik.handleChange("price")}
                onBlr={formik.handleBlur("price")}
                val={formik.values.price}
            />
            <div className="error">
              {formik.touched.price && formik.errors.price}
            </div>
            <select
                name="brand"
                onChange={formik.handleChange("brand")}
                onBlur={formik.handleBlur("brand")}
                value={formik.values.brand}
                className="form-control py-3 mb-3"
                id=""
            >
              <option value="">Select Brand</option>
              {brandState.map((i, j) => (
                  <option key={j} value={i.title}>
                    {i.title}
                  </option>
              ))}
            </select>
            <div className="error">
              {formik.touched.brand && formik.errors.brand}
            </div>
            <select
                name="category"
                onChange={formik.handleChange("category")}
                onBlur={formik.handleBlur("category")}
                value={formik.values.category}
                className="form-control py-3 mb-3"
                id=""
            >
              <option value="">Select Category</option>
              {catState.map((i, j) => (
                  <option key={j} value={i.title}>
                    {i.title}
                  </option>
              ))}
            </select>
            <div className="error">
              {formik.touched.category && formik.errors.category}
            </div>
            <select
                name="tags"
                onChange={formik.handleChange("tags")}
                onBlur={formik.handleBlur("tags")}
                value={formik.values.tags}
                className="form-control py-3 mb-3"
                id=""
            >
              <option value="" disabled>
                Select Tag
              </option>
              <option value="featured">Featured</option>
              <option value="popular">Popular</option>
              <option value="special">Special</option>
            </select>
            <div className="error">
              {formik.touched.tags && formik.errors.tags}
            </div>
            <Select
                mode="multiple"
                allowClear
                className="w-100"
                placeholder="Select colors"
                defaultValue={color}
                onChange={handleColors}
                value={formik.values.color.map((item) => item._id)} // Map to the _id values
                options={colorState.map((c) => ({
                  label: c.title,
                  value: c._id,
                }))}
            />
            <div className="error">
              {formik.touched.color && formik.errors.color}
            </div>
            <CustomInput
                type="number"
                label="Enter Product Quantity"
                name="quantity"
                onChng={formik.handleChange("quantity")}
                onBlr={formik.handleBlur("quantity")}
                val={formik.values.quantity}
            />
            <div className="error">
              {formik.touched.quantity && formik.errors.quantity}
            </div>
            <div className="bg-white border-1 p-5 text-center">
              <Dropzone onDrop={handleDrop}>
                {({ getRootProps, getInputProps }) => (
                    <section>
                      <div {...getRootProps()}>
                        <input {...getInputProps()} />
                        <p>Drag 'n' drop some files here, or click to select files</p>
                      </div>
                    </section>
                )}
              </Dropzone>
            </div>
            <div className="showimages d-flex flex-wrap gap-3">
              {imgState.map((img, index) => (
                  <div className="position-relative" key={index}>
                    <button
                        type="button"
                        onClick={() => {
                          dispatch(delImg(img.public_id));
                          setImgState(imgState.filter((i) => i.public_id !== img.public_id));
                        }}
                        className="btn-close position-absolute"
                        style={{ top: "10px", right: "10px" }}
                    ></button>
                    <img src={img.url} alt="" width={200} height={200} />
                  </div>
              ))}
            </div>
            <button
                className="btn btn-success border-0 rounded-3 my-5"
                type="submit"
            >
              {getProductId !== undefined ? "Edit" : "Add"} Product
            </button>
          </form>
        </div>
      </div>
  );
};

export default AddProduct;
