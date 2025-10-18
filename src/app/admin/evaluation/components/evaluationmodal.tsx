import React, { useState } from "react";
import GlobalModal, { GlobalModalField } from "../../../components/GlobalModal";


interface EvaluationModalProps {
	show: boolean;
	onClose: () => void;
	onSubmit: (form: {
		teacher_id: string;
		student_id: string;
		expires_at: string;
		password: string;
		status: string;
		created_by: string;
	}) => Promise<void>;
}


export default function EvaluationModal({ show, onClose, onSubmit }: EvaluationModalProps) {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	const fields: GlobalModalField[] = [
		{ key: "teacher_id", label: "Teacher ID" }
	];

		async function handleSubmit(data: Record<string, any>) {
			setLoading(true);
			setError("");
			try {
				// Only teacher_id is submitted
				await onSubmit(data.teacher_id);
				onClose();
			} catch (err: any) {
				setError(err.message || "Submission failed");
			}
			setLoading(false);
		}

	return (
		<>
			<GlobalModal
				show={show}
				title="Create Evaluation"
				fields={fields}
				onClose={onClose}
				onSubmit={handleSubmit}
				submitText={loading ? "Submitting..." : "Submit Evaluation"}
				cancelText="Cancel"
			/>
			{error && <div style={{ color: "#e53935", marginTop: 8 }}>{error}</div>}
		</>
	);
}
