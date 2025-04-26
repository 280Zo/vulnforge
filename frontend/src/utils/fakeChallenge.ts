export interface Challenge {
    language: string;
    difficulty: string;
    files: Record<string, string>; // filename -> file content
    vulnerableFile: string;
    vulnerableLine: number;
    vulnType: string;
    impact: string;
  }
  
  export function generateFakeChallenge(language: string, difficulty: string): Challenge {
    return {
      language,
      difficulty,
      files: {
        "app.py": `import flask, render_template, request
  from models import user, db
  from validate_input import utils
  
  @app.route('/reset_password', methods=['POST', 'GET'])
  def reset_password():
      if request.method == 'POST':
          username = request.form['username']
          password = request.form['password']
          user = User.query.filter_by(username=username).first()
          user.password = password  # <--- Vulnerable line (no auth!)
          db.session.commit()
          return "Password reset successful"
      return render_template('reset_password.html')`,
        "models.py": `class User(db.Model):
      id = db.Column(db.Integer, primary_key=True)
      username = db.Column(db.String(80), unique=True)
      password = db.Column(db.String(120))`,
        "utils.py": `def sanitize(input):
      return input.replace(\"<\", \"\").replace(\">\", \"\")`,
      },
      vulnerableFile: "app.py",
      vulnerableLine: 9, // (zero-indexed + 1)
      vulnType: "Insecure Direct Object Reference (IDOR)",
      impact: "Unauthorized users can reset any password without authentication",
    };
  }
  