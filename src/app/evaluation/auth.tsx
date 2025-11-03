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

			const handleSubmit = async (e: React.FormEvent) => {
				e.preventDefault();
				setError("");
				setSuccess(false);
				if (!studentId.trim()) {
					setError("Student ID is required.");
					return;
				}
				if (!evaluationCode.trim()) {
					setError("Evaluation Code is required.");
					return;
				}

				// Check if student exists in database
				if (studentExists === false) {
					setError("Student ID not found in database. Please contact your administrator to add your student record first.");
					return;
				}

				if (studentExists === null) {
					setError("Please wait while we verify your student ID...");
					return;
				}

				try {
					// Check if student has already evaluated today
					const checkResponse = await apiFetch(`/api/proxy/evaluation/check-student-today/${encodeURIComponent(studentId.trim())}`);
					const checkData = await checkResponse.json();
					
					if (checkData.hasEvaluated) {
						const lastEvaluation = checkData.evaluations[0];
						const completedTime = new Date(lastEvaluation?.completed_at).toLocaleString();
						setError(`You have already completed an evaluation today for ${lastEvaluation?.teacher_name || 'a professor'}. You can only submit one evaluation per day. Last evaluation completed at: ${completedTime}`);
						return;
					}
				} catch (checkError) {
					console.error('Error checking student evaluation status:', checkError);
					setError("Unable to verify evaluation status. Please try again.");
					return;
				}

				// Validate against passwords from API
				const found = passwords.find(p => p.password === evaluationCode);
				if (found) {
					// Check if expires_at is in the past
					if (found.expires_at) {
						const expires = new Date(found.expires_at);
						const now = new Date();
						if (expires < now) {
							setError("Expired Evaluation Code.");
							return;
						}
					}
					setTeacherId(found.teacher_id);
					setEvaluationId(found.evaluation_id);
					setSuccess(true);
				} else {
					setError("Invalid Evaluation Code.");
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
							style={{ width: "100%", padding: "1rem", borderRadius: "10px", border: "1px solid #b0bec5", marginBottom: 16, fontSize: "1.1rem", background: "#f5f7fa" }}
							required
						/>
						<button 
							type="submit" 
							disabled={hasEvaluatedToday || studentExists === false}
							style={{ 
								width: "100%", 
								padding: "1rem", 
								borderRadius: "10px", 
								background: (hasEvaluatedToday || studentExists === false) ? "#bdbdbd" : "linear-gradient(90deg, #1976d2 0%, #90caf9 100%)", 
								color: "white", 
								fontWeight: 700, 
								fontSize: "1.15rem", 
								border: "none", 
								boxShadow: "0 2px 8px rgba(44,62,80,0.08)", 
								cursor: (hasEvaluatedToday || studentExists === false) ? "not-allowed" : "pointer", 
								letterSpacing: 0.5,
								opacity: (hasEvaluatedToday || studentExists === false) ? 0.6 : 1
							}}
						>
							{hasEvaluatedToday ? "Already Evaluated Today" : 
							 studentExists === false ? "Student Not Found" : 
							 "Login"}
						</button>
						{error && <div style={{ color: "#e53935", marginTop: 16, fontWeight: 600 }}>{error}</div>}
					</form>
				</div>
			);
}
