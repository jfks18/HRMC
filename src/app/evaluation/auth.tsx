"use client"
import EvaluationForm from "./form";
import React, { useState, useEffect } from "react";
import { apiFetch } from '../apiFetch';

export default function EvaluationAuth() {
			const [evaluationCode, setEvaluationCode] = useState("");
			const [studentId, setStudentId] = useState("");
			const [error, setError] = useState("");
			const [success, setSuccess] = useState(false);
			const [passwords, setPasswords] = useState<{ teacher_id: string; password: string; expires_at?: string; evaluation_id: string }[]>([]);
			const [teacherId, setTeacherId] = useState("");
			const [evaluationId, setEvaluationId] = useState("");
		const [hasEvaluatedToday, setHasEvaluatedToday] = useState(false);
		const [todayEvaluations, setTodayEvaluations] = useState<any[]>([]);
		const [studentExists, setStudentExists] = useState<boolean | null>(null);
		const [studentInfo, setStudentInfo] = useState<any>(null);
		const [evaluationCompleted, setEvaluationCompleted] = useState<boolean | null>(null);
		const [completedEvaluationInfo, setCompletedEvaluationInfo] = useState<any>(null);

		// Check if student exists in database and evaluation status
		const checkStudentEvaluationStatus = async (studentId: string) => {
			if (!studentId.trim()) {
				setHasEvaluatedToday(false);
				setTodayEvaluations([]);
				setStudentExists(null);
				setStudentInfo(null);
				return;
			}
			
			try {
				// First check if student exists in database
				const studentResponse = await apiFetch(`/api/proxy/students/${encodeURIComponent(studentId.trim())}`);
				
				if (studentResponse.ok) {
					const studentData = await studentResponse.json();
					setStudentExists(true);
					setStudentInfo(studentData);
					
					// Then check evaluation status
					const checkResponse = await apiFetch(`/api/proxy/evaluation/check-student-today/${encodeURIComponent(studentId.trim())}`);
					const checkData = await checkResponse.json();
					
					if (checkData.hasEvaluated) {
						setHasEvaluatedToday(true);
						setTodayEvaluations(checkData.evaluations);
					} else {
						setHasEvaluatedToday(false);
						setTodayEvaluations([]);
					}
				} else if (studentResponse.status === 404) {
					setStudentExists(false);
					setStudentInfo(null);
					setHasEvaluatedToday(false);
					setTodayEvaluations([]);
				} else {
					console.error('Error checking student:', studentResponse.status);
					setStudentExists(null);
					setStudentInfo(null);
				}
			} catch (error) {
				console.error('Error checking student status:', error);
				setHasEvaluatedToday(false);
				setTodayEvaluations([]);
				setStudentExists(null);
				setStudentInfo(null);
			}
		};

		// Check if specific evaluation is completed when both student ID and evaluation code are provided
		const checkSpecificEvaluationCompletion = async (studentId: string, evaluationCode: string) => {
			if (!studentId.trim() || !evaluationCode.trim()) {
				setEvaluationCompleted(null);
				setCompletedEvaluationInfo(null);
				return;
			}

			// Find the evaluation ID from the password
			const found = passwords.find(p => p.password === evaluationCode);
			if (!found) {
				setEvaluationCompleted(null);
				setCompletedEvaluationInfo(null);
				return;
			}

			try {
				const response = await apiFetch(`/api/proxy/evaluation/check-student-evaluation/${encodeURIComponent(studentId.trim())}/${found.evaluation_id}`);
				const data = await response.json();
				
				if (data.hasEvaluated) {
					setEvaluationCompleted(true);
					setCompletedEvaluationInfo(data);
				} else {
					setEvaluationCompleted(false);
					setCompletedEvaluationInfo(null);
				}
			} catch (error) {
				console.error('Error checking specific evaluation completion:', error);
				setEvaluationCompleted(null);
				setCompletedEvaluationInfo(null);
			}
		};

		// Check student status when student ID changes
		useEffect(() => {
			const timeoutId = setTimeout(() => {
				checkStudentEvaluationStatus(studentId);
			}, 1000); // Debounce for 1 second
			
			return () => clearTimeout(timeoutId);
		}, [studentId]);

		useEffect(() => {
				apiFetch('/api/proxy/evaluation/teacher-passwords')
					.then(res => res.json())
					.then(data => setPasswords(data.map((p: any) => ({teacher_id: p.teacher_id, password: p.password, expires_at: p.expires_at, evaluation_id: p.id })) ))
					.catch(() => setPasswords([]));
			}, []);

		// Check specific evaluation completion when both student ID and evaluation code are provided
		useEffect(() => {
			if (passwords.length > 0) {
				const timeoutId = setTimeout(() => {
					checkSpecificEvaluationCompletion(studentId, evaluationCode);
				}, 1000); // Debounce for 1 second
				
				return () => clearTimeout(timeoutId);
			}
		}, [studentId, evaluationCode, passwords]);

			const handleSubmit = async (e: React.FormEvent) => {
				e.preventDefault();
				setError("");
				setSuccess(false);
				
				// Basic validation
				if (!studentId.trim()) {
					setError("Student ID is required.");
					return;
				}
				if (!evaluationCode.trim()) {
					setError("Evaluation Code is required.");
					return;
				}

				try {
					// Use the new comprehensive validation endpoint
					const response = await apiFetch('/api/proxy/evaluation/validate-login', {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json',
						},
						body: JSON.stringify({
							student_id: studentId.trim(),
							evaluation_code: evaluationCode.trim()
						}),
					});

					const validationResult = await response.json();

					if (!validationResult.valid) {
						// Handle different error cases with specific messages
						switch (validationResult.error) {
							case 'student_not_found':
								setError("Student ID not found in database. Please contact your administrator to add your student record first.");
								break;
							case 'evaluation_not_found':
								setError("Invalid evaluation code. Please check the code and try again.");
								break;
							case 'evaluation_expired':
								const expiredDate = new Date(validationResult.evaluation.expires_at).toLocaleString();
								setError(`This evaluation has expired on ${expiredDate}. Please contact your instructor for a new evaluation code.`);
								break;
							case 'already_completed':
								const completedTime = new Date(validationResult.completion_details.completed_at).toLocaleString();
								setError(`You have already completed this evaluation for ${validationResult.evaluation.teacher_name}. Each student can only submit one response per evaluation. Completed at: ${completedTime}`);
								break;
							default:
								setError(validationResult.message || "Validation failed. Please try again.");
								break;
						}
						return;
					}

					// Validation successful - proceed to evaluation form
					console.log('Login validation successful:', validationResult);
					setTeacherId(validationResult.evaluation.teacher_id);
					setEvaluationId(validationResult.evaluation.id);
					setStudentInfo(validationResult.student);
					setSuccess(true);

				} catch (error) {
					console.error('Error during login validation:', error);
					setError("Unable to validate your credentials. Please check your connection and try again.");
				}
			};


			if (success) {
				return <EvaluationForm studentId={studentId} teacherId={teacherId} evaluationId={evaluationId} />;
			}
			return (
				<div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
					<form onSubmit={handleSubmit} style={{ background: "#fff", padding: 32, borderRadius: 16, boxShadow: "0 2px 12px rgba(44,62,80,0.13)", minWidth: 320 }}>
						<h2 style={{ marginBottom: 24, fontWeight: 700, color: "#1976d2" }}>Authentication</h2>
						<label style={{ fontWeight: 600, color: "#263238", marginBottom: 10, display: "block", fontSize: "1.1rem" }}>Student ID</label>
						<input
							type="text"
							value={studentId}
							onChange={e => setStudentId(e.target.value)}
							style={{ 
								width: "100%", 
								padding: "1rem", 
								borderRadius: "10px", 
								border: studentExists === false ? "2px solid #f44336" : 
								       hasEvaluatedToday ? "2px solid #ff9800" : 
								       studentExists === true ? "2px solid #4caf50" : "1px solid #b0bec5", 
								marginBottom: 8, 
								fontSize: "1.1rem", 
								background: studentExists === false ? "#ffebee" : 
								           hasEvaluatedToday ? "#fff3e0" : 
								           studentExists === true ? "#e8f5e8" : "#f5f7fa" 
							}}
							required
						/>
						{studentExists === true && studentInfo && (
							<div style={{ 
								background: "#e8f5e8", 
								border: "1px solid #4caf50", 
								borderRadius: "8px", 
								padding: "12px", 
								marginBottom: 16,
								fontSize: "0.9rem",
								color: "#2e7d32"
							}}>
								<div style={{ fontWeight: 600, marginBottom: 4, display: "flex", alignItems: "center", gap: 6 }}>
									✅ Student Found
								</div>
								<div style={{ fontSize: "0.85rem" }}>
									<strong>Name:</strong> {studentInfo.name}<br/>
									<strong>Year:</strong> {studentInfo.year}<br/>
									<strong>Course:</strong> {studentInfo.course}
								</div>
							</div>
						)}
						{studentExists === false && (
							<div style={{ 
								background: "#ffebee", 
								border: "1px solid #f44336", 
								borderRadius: "8px", 
								padding: "12px", 
								marginBottom: 16,
								fontSize: "0.9rem",
								color: "#c62828"
							}}>
								<div style={{ fontWeight: 600, marginBottom: 4, display: "flex", alignItems: "center", gap: 6 }}>
									❌ Student ID Not Found
								</div>
								<div style={{ fontSize: "0.85rem" }}>
									This Student ID is not registered in the system. Please contact your administrator to add your student record.
								</div>
							</div>
						)}
						{hasEvaluatedToday && (
							<div style={{ 
								background: "#fff3e0", 
								border: "1px solid #ff9800", 
								borderRadius: "8px", 
								padding: "12px", 
								marginBottom: 16,
								fontSize: "0.9rem",
								color: "#e65100"
							}}>
								<div style={{ fontWeight: 600, marginBottom: 4, display: "flex", alignItems: "center", gap: 6 }}>
									⚠️ Already Evaluated Today
								</div>
								{todayEvaluations.map((evaluation, index) => (
									<div key={index} style={{ fontSize: "0.85rem" }}>
										You completed an evaluation for <strong>{evaluation.teacher_name}</strong> at {new Date(evaluation.completed_at).toLocaleString()}
									</div>
								))}
								<div style={{ fontSize: "0.85rem", marginTop: 4, fontStyle: "italic" }}>
									You can only submit one evaluation per day.
								</div>
							</div>
						)}
						<label style={{ fontWeight: 600, color: "#263238", marginBottom: 10, display: "block", fontSize: "1.1rem" }}>Evaluation Code</label>
						<input
							type="text"
							value={evaluationCode}
							onChange={e => setEvaluationCode(e.target.value)}
							style={{ 
								width: "100%", 
								padding: "1rem", 
								borderRadius: "10px", 
								border: evaluationCompleted === true ? "2px solid #f44336" : "1px solid #b0bec5", 
								marginBottom: evaluationCompleted === true ? 8 : 16, 
								fontSize: "1.1rem", 
								background: evaluationCompleted === true ? "#ffebee" : "#f5f7fa" 
							}}
							required
						/>
						{evaluationCompleted === true && completedEvaluationInfo && (
							<div style={{ 
								background: "#ffebee", 
								border: "1px solid #f44336", 
								borderRadius: "8px", 
								padding: "12px", 
								marginBottom: 16,
								fontSize: "0.9rem",
								color: "#c62828"
							}}>
								<div style={{ fontWeight: 600, marginBottom: 4, display: "flex", alignItems: "center", gap: 6 }}>
									🚫 Evaluation Already Completed
								</div>
								<div style={{ fontSize: "0.85rem" }}>
									You have already completed this evaluation for <strong>{completedEvaluationInfo.teacher_name || 'this professor'}</strong>.<br/>
									Completed at: {new Date(completedEvaluationInfo.completed_at).toLocaleString()}<br/>
									<span style={{ fontStyle: 'italic', marginTop: 4, display: 'block' }}>
										Each student can only submit one response per evaluation.
									</span>
								</div>
							</div>
						)}
						<button 
							type="submit" 
							disabled={hasEvaluatedToday || studentExists === false || evaluationCompleted === true}
							style={{ 
								width: "100%", 
								padding: "1rem", 
								borderRadius: "10px", 
								background: (hasEvaluatedToday || studentExists === false || evaluationCompleted === true) ? "#bdbdbd" : "linear-gradient(90deg, #1976d2 0%, #90caf9 100%)", 
								color: "white", 
								fontWeight: 700, 
								fontSize: "1.15rem", 
								border: "none", 
								boxShadow: "0 2px 8px rgba(44,62,80,0.08)", 
								cursor: (hasEvaluatedToday || studentExists === false || evaluationCompleted === true) ? "not-allowed" : "pointer", 
								letterSpacing: 0.5,
								opacity: (hasEvaluatedToday || studentExists === false || evaluationCompleted === true) ? 0.6 : 1
							}}
						>
							{evaluationCompleted === true ? "Evaluation Already Completed" :
							 hasEvaluatedToday ? "Already Evaluated Today" : 
							 studentExists === false ? "Student Not Found" : 
							 "Login"}
						</button>
						{error && <div style={{ color: "#e53935", marginTop: 16, fontWeight: 600 }}>{error}</div>}
					</form>
				</div>
			);
}
