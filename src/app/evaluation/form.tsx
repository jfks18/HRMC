// ...existing code from form.tsx remains unchanged...

"use client";
import React, { useEffect, useState } from "react";
import { apiFetch } from '../apiFetch';

function EvaluationForm({ studentId, teacherId, teacherName, evaluationId }: { studentId: string, teacherId?: string, teacherName?: string, evaluationId?: string }) {
	const [questions, setQuestions] = useState<{ id: number; text: string }[]>([]);
	const [responses, setResponses] = useState<(number|string)[]>([]);
	const [submitted, setSubmitted] = useState(false);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [incomplete, setIncomplete] = useState<number[]>([]);

	useEffect(() => {
		apiFetch('/api/proxy/evaluation_questions')
				.then(res => res.json())
				.then(data => {
				const mapped = data.map((q: any) => ({ id: q.id, text: q.question_text }));
				setQuestions(mapped);
				// For remarks questions (21,22,23) use '', for others use undefined
				setResponses(mapped.map((q: any) => (q.id === 21 || q.id === 22 || q.id === 23) ? '' : undefined));
			})
			.catch(() => setQuestions([]));
	}, []);

	const handleChange = (idx: number, value: number) => {
		const updated = [...responses];
		updated[idx] = value;
		setResponses(updated);
		// clear incomplete flag for this question when answered
		if (incomplete.includes(idx)) {
			setIncomplete(prev => prev.filter(i => i !== idx));
		}
	};

	// handle remarks textarea change and clear incomplete flag
	const handleRemarksChange = (idx: number, value: string) => {
		const updated = [...responses];
		updated[idx] = value;
		setResponses(updated);
		if (incomplete.includes(idx)) {
			setIncomplete(prev => prev.filter(i => i !== idx));
		}
	};

		const handleSubmit = async (e: React.FormEvent) => {
			e.preventDefault();
			// Validate answers and collect incomplete question indexes
			const missing: number[] = [];
			questions.forEach((q, idx) => {
				const resp = responses[idx];
				if (q.id === 21 || q.id === 22 || q.id === 23) {
					if (!(typeof resp === 'string' && resp.trim() !== '')) missing.push(idx);
				} else {
					if (!(typeof resp === 'number' && resp >= 1 && resp <= 5)) missing.push(idx);
				}
			});
			if (missing.length > 0) {
				setIncomplete(missing);
				setError(`Please complete all questions before submitting. Missing: ${missing.map(i => questions[i]?.id).filter(Boolean).join(', ')}`);
				return;
			}
			setError("");
			setLoading(true);
			try {
						const submitPromises = questions.map(async (question, idx) => {
							const payload: any = {
								evaluation_id: evaluationId,
								question_id: question.id,
								student_id: studentId
							};
							if (question.id === 21 || question.id === 22 || question.id === 23) {
								payload.remarks = responses[idx];
							} else {
								payload.rating = responses[idx];
							}
							const response = await apiFetch('/api/proxy/evaluation_answers', {
									method: 'POST',
									headers: {
										'Content-Type': 'application/json'
									},
									body: JSON.stringify(payload)
								});
							if (!response.ok) {
								const errorText = await response.text();
								throw new Error(`Failed to submit answer for question ${question.id}: ${response.status} - ${errorText}`);
							}
							return response.json();
						});
				await Promise.all(submitPromises);
				setSubmitted(true);
			} catch (err) {
				const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
				setError(`Failed to submit evaluation: ${errorMessage}`);
			} finally {
				setLoading(false);
			}
		};

	return (
		<div style={{ maxWidth: 650, margin: "48px auto", background: "#f8fafc", padding: 0, borderRadius: 20, boxShadow: "0 4px 24px rgba(44,62,80,0.13)" }}>
			<div style={{ background: "linear-gradient(90deg, #1976d2 0%, #90caf9 100%)", borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: "32px 32px 16px 32px" }}>
				<h2 style={{ margin: 0, fontWeight: 800, color: "#fff", fontSize: "2rem", letterSpacing: 1 }}>Professor Evaluation</h2>
				<p style={{ color: "#e3f2fd", fontWeight: 500, marginTop: 8, fontSize: "1.1rem" }}>Please rate your professor's teaching performance.</p>
				<div style={{ color: "#fff", fontWeight: 600, fontSize: "1.08rem", marginTop: 10, background: "#1976d2", padding: "6px 18px", borderRadius: 8, display: "inline-block" }}>
					Student ID: {studentId}
				</div>
				{teacherName && (
					<div style={{ color: "#fff", fontWeight: 600, fontSize: "1.08rem", marginTop: 10, background: "#1976d2", padding: "6px 18px", borderRadius: 8, display: "inline-block" }}>
						Teacher Name: {teacherName}
					</div>
				)}
				{evaluationId && (
					<div style={{ color: "#fff", fontWeight: 600, fontSize: "1.08rem", marginTop: 10, background: "#1976d2", padding: "6px 18px", borderRadius: 8, display: "inline-block" }}>
						Evaluation ID: {evaluationId}
					</div>
				)}
			</div>
			<form onSubmit={handleSubmit} style={{ padding: "32px" }}>
								<div style={{ marginBottom: 32 }}>
										<div style={{ height: 8, background: "#e3f2fd", borderRadius: 4, overflow: "hidden" }}>
												<div style={{ width: `${(
													responses.filter((r, idx) => {
														const q = questions[idx];
														if (!q) return false;
														if (q.id === 21 || q.id === 22 || q.id === 23) {
															return typeof r === 'string' && r.trim() !== '';
														}
														return typeof r === 'number' && r >= 1 && r <= 5;
													}).length / questions.length) * 100}%`, height: "100%", background: "#1976d2", transition: "width 0.3s" }} />
										</div>
										<div style={{ textAlign: "right", color: "#1976d2", fontWeight: 600, fontSize: "0.95rem", marginTop: 4 }}>
												{responses.filter((r, idx) => {
													const q = questions[idx];
													if (!q) return false;
													if (q.id === 21 || q.id === 22 || q.id === 23) {
														return typeof r === 'string' && r.trim() !== '';
													}
													return typeof r === 'number' && r >= 1 && r <= 5;
												}).length} / {questions.length} answered
										</div>
								</div>
				{questions.length === 0 && (
					<div style={{ color: '#e53935', fontWeight: 700, fontSize: '1.08rem', marginBottom: 24 }}>
						No evaluation questions found. Please check your database and API.
					</div>
				)}
								{/* Categorized questions with section headers */}
								{(() => {
									const sections = [
										{ label: 'Instructional Competence', range: [1,8] },
										{ label: 'Classroom and Student Management', range: [9,12] },
										{ label: 'Professionalism and Ethics', range: [13,17] },
									];
									let lastSection = '';
									return questions.map((q, idx) => {
										let section = '';
										if (q.id >= 1 && q.id <= 8) section = 'Instructional Competence';
										else if (q.id >= 9 && q.id <= 11) section = 'Classroom and Student Management';
										else if (q.id >= 13 && q.id <= 17) section = 'Professionalism and Ethics';
										else section = 'Spiritual and Values';
										const showHeader = section !== lastSection;
										lastSection = section;
										const isIncomplete = incomplete.includes(idx);
										return (
											<React.Fragment key={q.id}>
												{showHeader && (
													<div style={{ fontWeight: 800, color: '#1976d2', fontSize: '1.15rem', margin: '32px 0 12px 0', letterSpacing: 0.5 }}>
														{section}
													</div>
												)}

												<div style={{ marginBottom: 28, padding: "18px 20px", background: "#fff", borderRadius: 12, boxShadow: "0 1px 6px rgba(44,62,80,0.07)", border: isIncomplete ? "2px solid #e53935" : ((q.id === 21 || q.id === 22 || q.id === 23 ? (typeof responses[idx] === 'string' && responses[idx].trim() !== '') : responses[idx] != null && responses[idx] !== 0) ? "2px solid #90caf9" : "2px solid #eceff1") }}>
													<label style={{ fontWeight: 700, color: "#263238", marginBottom: 10, display: "block", fontSize: "1.08rem" }}>{q.id}. {q.text}</label>
													{q.id === 21 || q.id === 22 || q.id === 23 ? (
														<>
															<label style={{ fontWeight: 600, color: "#1976d2", marginBottom: 6, display: "block" }}>Remarks</label>
															<textarea
															value={typeof responses[idx] === 'string' ? responses[idx] : ''}
															onChange={e => handleRemarksChange(idx, e.target.value)}
																rows={3}
																style={{ width: "100%", borderRadius: 8, border: "1px solid #90caf9", padding: 10, fontSize: "1.08rem" }}
																required
															/>
															{isIncomplete && <div style={{ color: '#e53935', fontWeight: 700, marginTop: 8 }}>Required</div>}
														</>
													) : (
														<div style={{ display: "flex", gap: 18, marginTop: 8 }}>
															{[1,2,3,4,5].map(rating => (
																<label key={rating} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, cursor: "pointer" }}>
																	<input
																		type="radio"
																		name={`q${q.id}`}
																		value={rating}
																		checked={responses[idx] === rating}
																		onChange={() => handleChange(idx, rating)}
																		required
																		style={{ accentColor: "#1976d2", width: 22, height: 22, marginBottom: 2 }}
																	/>
																	<span style={{ fontWeight: 600, color: responses[idx] === rating ? "#1976d2" : "#78909c", fontSize: "1.08rem" }}>{rating}</span>
																</label>
															))}
															{isIncomplete && <div style={{ color: '#e53935', fontWeight: 700, marginTop: 8 }}>Required</div>}
														</div>
													)}
												</div>
											</React.Fragment>
										);
									});
								})()}
				<button
					type="submit"
					disabled={loading || submitted}
					style={{
						width: "100%",
						padding: "1.1rem",
						borderRadius: "12px",
						background: loading || submitted ? "#90a4ae" : "linear-gradient(90deg, #1976d2 0%, #90caf9 100%)",
						color: "white",
						fontWeight: 800,
						fontSize: "1.18rem",
						border: "none",
						boxShadow: "0 2px 12px rgba(44,62,80,0.10)",
						cursor: loading || submitted ? "not-allowed" : "pointer",
						letterSpacing: 0.7,
						marginTop: 12,
						opacity: loading || submitted ? 0.7 : 1
					}}
				>
					{loading ? "Submitting..." : submitted ? "Submitted!" : "Submit Evaluation"}
				</button>
				{error && <div style={{ color: "#e53935", marginTop: 18, fontWeight: 700, fontSize: "1.08rem" }}>{error}</div>}
				{submitted && <div style={{ color: "#2e7d32", marginTop: 18, fontWeight: 700, fontSize: "1.08rem" }}>Thank you for your evaluation!</div>}
			</form>
		</div>
	);
}

export default function EvaluationFormWrapper({ studentId, teacherId, evaluationId }: { studentId: string, teacherId?: string, evaluationId?: string }) {
	const [professors, setProfessors] = useState<{ id: string; name: string }[]>([]);
	const [teacherName, setTeacherName] = useState<string>("");

	useEffect(() => {
		apiFetch('/api/proxy/users/professors')
			.then(res => res.json())
			.then(data => setProfessors(data));
	}, []);

	useEffect(() => {
		if (teacherId && professors.length > 0) {
			const prof = professors.find(p => p.id === teacherId);
			setTeacherName(prof ? prof.name : "");
		}
	}, [teacherId, professors]);

	return (
		<EvaluationForm
			studentId={studentId}
			teacherId={teacherId}
			teacherName={teacherName}
			evaluationId={evaluationId}
		/>
	);
}
