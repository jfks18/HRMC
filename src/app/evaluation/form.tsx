// ...existing code from form.tsx remains unchanged...

"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from 'next/navigation';
import { apiFetch } from '../apiFetch';

function EvaluationForm({ studentId, teacherId, teacherName, evaluationId }: { studentId: string, teacherId?: string, teacherName?: string, evaluationId?: string }) {
	const router = useRouter();
	const [questions, setQuestions] = useState<{ id: number; text: string }[]>([]);
	const [responses, setResponses] = useState<(number|string)[]>([]);
	const [submitted, setSubmitted] = useState(false);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [incomplete, setIncomplete] = useState<number[]>([]);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
	const [lockedQuestions, setLockedQuestions] = useState<Set<number>>(new Set());
	const [redirectCountdown, setRedirectCountdown] = useState<number | null>(null);

	useEffect(() => {
		apiFetch('/api/proxy/evaluation_questions')
				.then(res => res.json())
				.then(data => {
				const mapped = data.map((q: any) => ({ id: q.id, text: q.question_text }));
				setQuestions(mapped);
				// For remarks questions (21,22,23) use '', for others use undefined
				setResponses(mapped.map((q: any) => (q.id === 21 || q.id === 22 || q.id === 23) ? '' : undefined));
				// Reset to first section when questions load
				setCurrentSectionIndex(0);
				// Reset locked questions
				setLockedQuestions(new Set());
			})
			.catch(() => setQuestions([]));
	}, []);

	// Cleanup countdown interval on unmount
	useEffect(() => {
		return () => {
			setRedirectCountdown(null);
		};
	}, []);

	const handleChange = (idx: number, value: number) => {
		// Don't allow changes if question is locked
		if (lockedQuestions.has(idx)) {
			return;
		}
		
		const updated = [...responses];
		updated[idx] = value;
		setResponses(updated);
		
		// Lock the question after answering
		setLockedQuestions(prev => new Set(prev).add(idx));
		
		// clear incomplete flag for this question when answered
		if (incomplete.includes(idx)) {
			setIncomplete(prev => prev.filter(i => i !== idx));
		}
	};

	// handle remarks textarea change and clear incomplete flag
	const handleRemarksChange = (idx: number, value: string) => {
		// Don't allow changes if question is locked
		if (lockedQuestions.has(idx)) {
			return;
		}
		
		const updated = [...responses];
		updated[idx] = value;
		setResponses(updated);
		
		// Lock the question after typing (with a small delay to allow typing)
		if (value.trim() !== '') {
			setTimeout(() => {
				setLockedQuestions(prev => new Set(prev).add(idx));
			}, 2000); // Lock after 2 seconds of no changes
		}
		
		if (incomplete.includes(idx)) {
			setIncomplete(prev => prev.filter(i => i !== idx));
		}
	};



	// Function to completely reset the form to initial state
	const resetFormToInitialState = () => {
		// Reset all form states to initial values
		setResponses([]); // This will be re-initialized by the useEffect
		setLockedQuestions(new Set()); // Clear all locks
		setError("");
		setIncomplete([]);
		setCurrentSectionIndex(0);
		setSubmitted(false);
		setLoading(false);
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
				
				// Reset the entire form to initial locked state
				resetFormToInitialState();
				// Redirect immediately to thank-you page
				router.replace('/evaluation/thank-you');
			} catch (err) {
				const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
				setError(`Failed to submit evaluation: ${errorMessage}`);
			} finally {
				setLoading(false);
			}
		};

	// Section helpers
	const getSectionName = (qid: number) => {
		if (qid >= 1 && qid <= 8) return 'Instructional Competence';
		if (qid >= 9 && qid <= 12) return 'Classroom and Student Management';
		if (qid >= 13 && qid <= 17) return 'Professionalism and Ethics';
		if (qid === 21) return 'Comments';
		return 'Spiritual and Values';
	};

	const orderedSections = useMemo(() => {
		const seen = new Set<string>();
		const order: string[] = [];
		questions.forEach(q => {
			const s = getSectionName(q.id);
			if (!seen.has(s)) { seen.add(s); order.push(s); }
		});
		return order;
	}, [questions]);

	const currentSection = orderedSections[currentSectionIndex] || '';

	const questionIndexesInSection = useMemo(() => {
		const arr: number[] = [];
		questions.forEach((q, idx) => {
			if (getSectionName(q.id) === currentSection) arr.push(idx);
		});
		return arr;
	}, [questions, currentSection]);

	const isAnswered = (idx: number) => {
		const q = questions[idx];
		const resp = responses[idx];
		if (!q) return false;
		if (q.id === 21 || q.id === 22 || q.id === 23) return typeof resp === 'string' && String(resp).trim() !== '';
		return typeof resp === 'number' && resp >= 1 && resp <= 5;
	};

	const isCurrentSectionComplete = questionIndexesInSection.every(isAnswered);

	const goPrev = () => setCurrentSectionIndex(i => Math.max(0, i - 1));
	const goNext = () => setCurrentSectionIndex(i => Math.min(orderedSections.length - 1, i + 1));

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

								{/* Section Card */}
								<div style={{ marginBottom: 28, padding: "22px 22px", background: "#fff", borderRadius: 14, boxShadow: "0 2px 12px rgba(44,62,80,0.08)", border: "1px solid #e3f2fd" }}>
									<div style={{ fontWeight: 800, color: '#1976d2', fontSize: '1.18rem', marginBottom: 12, letterSpacing: 0.4 }}>
										{currentSection || 'Evaluation'}
									</div>
									{questionIndexesInSection.map(idx => {
										const q = questions[idx];
										const isIncomplete = incomplete.includes(idx);
										return (
											<div key={q.id} style={{ marginBottom: 24, padding: "16px 18px", background: "#fff", borderRadius: 12, boxShadow: "0 1px 6px rgba(44,62,80,0.07)", border: isIncomplete ? "2px solid #e53935" : (isAnswered(idx) ? "2px solid #90caf9" : "2px solid #eceff1") }}>
												<label style={{ fontWeight: 700, color: "#263238", marginBottom: 10, display: "block", fontSize: "1.08rem" }}>{q.id}. {q.text}</label>
												{q.id === 21 || q.id === 22 || q.id === 23 ? (
													<>
														<div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
															<label style={{ fontWeight: 600, color: "#1976d2" }}>{q.id === 21 ? 'Comments' : 'Remarks'}</label>
															{lockedQuestions.has(idx) && (
																<div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#e53935', fontSize: '0.9rem', fontWeight: 600 }}>
																	<span>🔒</span> Locked
																</div>
															)}
														</div>
														<textarea
															value={typeof responses[idx] === 'string' ? responses[idx] : ''}
															onChange={e => handleRemarksChange(idx, e.target.value)}
															rows={3}
															placeholder={q.id === 21 ? 'Write your comments about the faculty member here...' : 'Add your remarks here...'}
															style={{ 
																width: "100%", 
																borderRadius: 8, 
																border: "1px solid #90caf9", 
																padding: 10, 
																fontSize: "1.08rem",
																backgroundColor: lockedQuestions.has(idx) ? '#f5f5f5' : '#fff',
																cursor: lockedQuestions.has(idx) ? 'not-allowed' : 'text'
															}}
															disabled={lockedQuestions.has(idx)}
															required
														/>
														{isIncomplete && <div style={{ color: '#e53935', fontWeight: 700, marginTop: 8 }}>Required</div>}
													</>
												) : (
													<>
														{lockedQuestions.has(idx) && (
															<div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
																<span style={{ color: '#e53935', fontSize: '0.9rem', fontWeight: 600 }}>🔒 Answer locked - cannot be changed</span>
															</div>
														)}
														<div style={{ display: "flex", gap: 18, marginTop: 8, flexWrap: 'wrap' }}>
															{[1,2,3,4,5].map(rating => (
																<label key={rating} style={{ 
																	display: "flex", 
																	flexDirection: "column", 
																	alignItems: "center", 
																	gap: 4, 
																	cursor: lockedQuestions.has(idx) ? "not-allowed" : "pointer",
																	opacity: lockedQuestions.has(idx) ? 0.6 : 1
																}}>
																	<input
																		type="radio"
																		name={`q${q.id}`}
																		value={rating}
																		checked={responses[idx] === rating}
																		onChange={() => handleChange(idx, rating)}
																		disabled={lockedQuestions.has(idx)}
																		required
																		style={{ 
																			accentColor: "#1976d2", 
																			width: 22, 
																			height: 22, 
																			marginBottom: 2,
																			cursor: lockedQuestions.has(idx) ? "not-allowed" : "pointer"
																		}}
																	/>
																	<span style={{ fontWeight: 600, color: responses[idx] === rating ? "#1976d2" : "#78909c", fontSize: "1.08rem" }}>{rating}</span>
																</label>
															))}
															{isIncomplete && <div style={{ color: '#e53935', fontWeight: 700, marginTop: 8 }}>Required</div>}
														</div>
													</>
												)}
											</div>
										);
									})}

									{/* Section navigation */}
									<div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginTop: 8 }}>
										<button
											type="button"
											className="btn btn-outline-secondary"
											onClick={goPrev}
											disabled={currentSectionIndex === 0 || loading || submitted}
										>
											<i className="bi bi-arrow-left me-1"></i> Previous
										</button>
										{currentSectionIndex < Math.max(0, orderedSections.length - 1) ? (
											<button
												type="button"
												className="btn btn-primary"
												onClick={goNext}
												disabled={!isCurrentSectionComplete || loading || submitted}
												style={{ backgroundColor: isCurrentSectionComplete ? '#1976d2' : '#90a4ae', borderColor: 'transparent' }}
											>
												Next <i className="bi bi-arrow-right ms-1"></i>
											</button>
										) : (
											<button
												type="submit"
												className="btn btn-success"
												disabled={!isCurrentSectionComplete || loading || submitted}
											>
												<i className="bi bi-check2-circle me-1"></i> Submit Evaluation
											</button>
										)}
									</div>
								</div>

				{error && <div style={{ color: "#e53935", marginTop: 18, fontWeight: 700, fontSize: "1.08rem" }}>{error}</div>}
				{submitted && (
					<div style={{ 
						color: "#2e7d32", 
						marginTop: 18, 
						fontWeight: 700, 
						fontSize: "1.08rem",
						padding: "20px",
						background: "#e8f5e8",
						borderRadius: "12px",
						border: "2px solid #2e7d32",
						textAlign: "center"
					}}>
						<div style={{ marginBottom: 12, fontSize: "1.2rem" }}>✅ Evaluation Completed Successfully!</div>
						<div style={{ marginBottom: 8, fontSize: "1rem", color: "#2e7d32" }}>
							Thank you for your feedback. Your responses have been saved.
						</div>
						<div style={{ fontSize: "0.9rem", color: "#1b5e20", marginBottom: 8 }}>
							Redirecting to thank you page...
						</div>
					</div>
				)}
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
