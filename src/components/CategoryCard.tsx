"use client";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

import { deleteDoc, doc } from "firebase/firestore";

import { useState } from "react";
import { AlertCircle, Loader2, X } from "lucide-react";
import { CategoryWithId } from "../../types/types";
import { db } from "../../lib/firebase/firebase";

interface CategoryCardProps {
  category: CategoryWithId;
  onDelete?: (id: string) => void;
}

const CategoryCard = ({ category, onDelete }: CategoryCardProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);

  const handleDelete = async () => {
    try {
      setLoading(true);
      setError(null);

      const categoryRef = doc(db, "categories", category.id);
      await deleteDoc(categoryRef);

      setIsDeleted(true);

      // Notify parent component
      if (onDelete) {
        onDelete(category.id);
      }

      setTimeout(() => {
        setShowConfirm(false);
      }, 1500);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to delete category"
      );
      setShowConfirm(false);
    } finally {
      setLoading(false);
    }
  };

  // If the category has been deleted, show nothing (component will be removed by parent)
  if (isDeleted) {
    return null;
  }

  return (
    <div className="relative bg-zinc-900 rounded-lg overflow-hidden shadow-md border border-zinc-800 transition-all hover:shadow-lg">
      {/* Delete Confirmation Overlay */}
      {showConfirm && (
        <div className="absolute inset-0 bg-black/80 z-10 flex flex-col items-center justify-center p-4 text-white">
          {loading ? (
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-indigo-400" />
              <p className="text-indigo-200">Deleting...</p>
            </div>
          ) : (
            <>
              <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Delete Category?</h3>
              <p className="text-sm text-center mb-4 text-gray-300">
                Are you sure you want to delete "{category.name}"? This action
                cannot be undone.
              </p>
              <div className="flex gap-3 w-full max-w-xs">
                <Button
                  className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white"
                  onClick={() => setShowConfirm(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                  onClick={handleDelete}
                >
                  Delete
                </Button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="absolute top-2 left-2 right-2 bg-red-900/50 border border-red-700 text-red-200 px-4 py-2 rounded z-20 flex items-center">
          <span className="flex-1 text-sm">{error}</span>
          <X
            size={16}
            className="cursor-pointer"
            onClick={() => setError(null)}
          />
        </div>
      )}

      {/* Card Content */}
      <div className="relative h-48">
        <Image
          src={category.imageUrl}
          alt={category.name}
          fill
          className="object-contain p-2"
        />
      </div>
      <div className="p-4">
        <h3 className="font-medium text-lg text-white">{category.name}</h3>
        <p className="font-light text-xs text-gray-400">
          Slug: {category.slug}
        </p>
        <div className="flex justify-between items-center mt-2">
          <span className="text-xs text-gray-500">
            {category.createdAt
              ? new Date(category.createdAt).toLocaleDateString()
              : "No date"}
          </span>
          <div className="flex gap-2">
            <Link href={`/admin/categories/new/${category.id}`}>
              <Button
                className="cursor-pointer hoverEffect"
                variant="outline"
                size="sm"
              >
                Edit
              </Button>
            </Link>
            <Button
              className="cursor-pointer bg-red-600 hover:bg-red-700 text-white"
              variant="outline"
              size="sm"
              onClick={() => setShowConfirm(true)}
            >
              Delete
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryCard;
