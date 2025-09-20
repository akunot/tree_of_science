import { useState } from "react"
import { Link } from "react-router-dom";
import { 
  BookOpen, TreePine, Users, FileText, BarChart3, Download 
} from "lucide-react"
import { 
  Tabs, TabsContent, TabsList, TabsTrigger 
} from "./components/ui/tabs"
import { Button } from "./components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./components/ui/card"

const features = [
  { icon: BookOpen, title: "Gestión de Bibliografía", desc: "Suba y gestione sus archivos bibliográficos. Organice su investigación de manera eficiente." },
  { icon: TreePine, title: "Generación de Árboles", desc: "Cree árboles de la ciencia a partir de sus datos bibliográficos utilizando semillas personalizadas." },
  { icon: BarChart3, title: "Visualización Interactiva", desc: "Explore sus árboles científicos con visualizaciones interactivas y herramientas de análisis." },
  { icon: FileText, title: "Historial de Proyectos", desc: "Acceda al historial completo de árboles creados y continúe su trabajo desde donde lo dejó." },
  { icon: Download, title: "Exportación Múltiple", desc: "Descargue sus árboles en diversos formatos (JSON, CSV, PDF) para su uso en publicaciones." },
  { icon: Users, title: "Colaboración", desc: "Comparta sus árboles con colegas y colabore en proyectos de investigación científica." }
]

const steps = [
  { id: "step1", title: "Registro y Autenticación", text: "Cree su cuenta con su correo institucional. Autenticación segura con JWT para proteger sus datos." },
  { id: "step2", title: "Carga de Bibliografía", text: "Suba sus archivos en múltiples formatos. El sistema organiza sus documentos para fácil acceso." },
  { id: "step3", title: "Generación de Árboles", text: "Ingrese una semilla y genere un árbol científico mostrando las relaciones entre conceptos." },
  { id: "step4", title: "Análisis y Descarga", text: "Analice visualizaciones interactivas y descargue resultados en diversos formatos." }
]

function Header({ isLoggedIn }) {
  return (
    <header className="bg-card shadow-sm border-b">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-lg">UN</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-primary">Universidad Nacional de Colombia</h1>
            <p className="text-sm text-muted-foreground">Sistema de Árboles de la Ciencia</p>
          </div>
        </div>
        <nav className="flex items-center space-x-3">
          {isLoggedIn ? (
            <>
              <Link to="/dashboard"><Button variant="outline">Mi Panel</Button></Link>
              <Button variant="default">Cerrar Sesión</Button>
            </>
          ) : (
            <>
              <Link to="/login"><Button variant="outline">Iniciar Sesión</Button></Link>
              <Link to="/register"><Button variant="default">Registrarse</Button></Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}

function Hero() {
  return (
    <section className="py-20 px-4 unal-gradient text-center text-white">
      <div className="container mx-auto">
        <h2 className="text-4xl md:text-6xl font-bold mb-6 animate-pulse-slow">
          Árboles de la Ciencia
        </h2>
        <p className="text-lg md:text-xl mb-8 max-w-3xl mx-auto">
          Plataforma para la visualización y análisis de relaciones científicas. 
          Transforme sus datos bibliográficos en visualizaciones interactivas.
        </p>
        <div className="flex justify-center gap-4">
          <Link to="/register">
            <Button size="lg" className="bg-primary text-primary-foreground">Comenzar Ahora</Button>
          </Link>
          <Link to="/about">
            <Button size="lg" variant="outline">Conocer Más</Button>
          </Link>
        </div>
      </div>
    </section>
  )
}

function Features() {
  return (
    <section className="py-16 px-4 bg-background">
      <div className="container mx-auto">
        <h3 className="text-3xl font-bold text-center text-primary mb-12">
          Características Principales
        </h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map(({ icon: Icon, title, desc }) => (
            <Card key={title} className="hover:shadow-lg transition-shadow glass-effect">
              <CardHeader>
                <Icon className="w-8 h-8 text-primary mb-2" />
                <CardTitle>{title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{desc}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

function HowItWorks() {
  return (
    <section className="py-16 px-4 bg-muted">
      <div className="container mx-auto">
        <h3 className="text-3xl font-bold text-center text-primary mb-12">
          Cómo Funciona
        </h3>
        <Tabs defaultValue="step1" className="max-w-4xl mx-auto">
          <TabsList className="grid w-full grid-cols-4">
            {steps.map(step => (
              <TabsTrigger key={step.id} value={step.id}>{step.id.replace("step","Paso ")}</TabsTrigger>
            ))}
          </TabsList>
          {steps.map(({ id, title, text }) => (
            <TabsContent key={id} value={id} className="mt-8">
              <Card>
                <CardHeader>
                  <CardTitle>{title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{text}</p>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  )
}


function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground py-12 px-4">
      <div className="container mx-auto flex flex-col md:flex-row justify-center items-start md:items-center gap-8 text-center md:text-left">
        {/* Universidad */}
        <div className="md:w-1/3">
          <h4 className="text-lg font-semibold mb-4">Universidad Nacional de Colombia</h4>
          <p className="text-sm text-muted-foreground">
            Plataforma de investigación y visualización científica para la comunidad académica.
          </p>
        </div>

        {/* Enlaces rápidos */}
        <div className="md:w-1/3">
          <h4 className="text-lg font-semibold mb-4">Enlaces Rápidos</h4>
          <ul className="space-y-2">
            {["about","contact","help","privacy"].map(link => (
              <li key={link}>
                <Link to={`/${link}`} className="hover:underline capitalize">
                  {link}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contacto */}
        <div className="md:w-1/3">
          <h4 className="text-lg font-semibold mb-4">Contacto</h4>
          <p className="text-sm text-muted-foreground">
            Email: soporte@unal.edu.co<br/>
            Teléfono: +57 1 316 5000<br/>
            Bogotá, Colombia
          </p>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-border mt-8 pt-8 text-center text-xs text-muted-foreground">
        &copy; 2024 Universidad Nacional de Colombia. Todos los derechos reservados.
      </div>
    </footer>
  );
}

export default function Home() {
  const [isLoggedIn] = useState(false)

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header isLoggedIn={isLoggedIn} />
      <Hero />
      <Features />
      <HowItWorks />
      <Footer />
    </div>
  )
}
